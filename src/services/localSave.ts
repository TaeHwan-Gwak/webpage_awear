export type SavableFile = 'members.json' | 'news.json' | 'publications.json' | 'equipment.json'
export type ImageFolder = 'publications' | 'member' | 'news' | 'equipment'

// 로컬 dev든(Vite 플러그인) 배포 환경이든(Vercel Function + GitHub API) 이 헤더로 인증합니다.
// 배포 환경에서는 서버가 같은 값(VITE_ADMIN_PASSWORD)과 비교해서 확인합니다.
function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-admin-password': import.meta.env.VITE_ADMIN_PASSWORD ?? '',
  }
}

const isDev = import.meta.env.DEV

/*
 * 로컬 dev: 수정 하나하나가 바로 파일에 반영되고(기존과 동일), 로컬 전용 "Save"
 * 버튼이 git push만 담당합니다.
 *
 * 배포 환경: 화면에는 즉시 반영되지만(Vue 상태가 그때그때 바뀌니까), 실제 GitHub
 * 커밋은 nav의 "Save"를 눌러야 나갑니다 — 그래야 수정할 때마다 커밋이 하나씩
 * 쌓이는 걸 피할 수 있습니다. 그때까진 아래 큐에 쌓아두기만 합니다.
 */
const pendingJsonSaves = new Map<SavableFile, unknown>()
const pendingUploads = new Map<string, { folder: ImageFolder; filename: string; blob: Blob }>() // key: blob: 미리보기 URL
const pendingDeletes = new Set<string>()

async function saveJsonFileNow(file: SavableFile, data: unknown): Promise<boolean> {
  try {
    const res = await fetch('/api/local-save', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ file, data }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function saveJsonFile(file: SavableFile, data: unknown): Promise<boolean> {
  if (isDev) return saveJsonFileNow(file, data)
  // 배포 환경: 큐에 최신 상태로 넣어두기만 하고, 실제 커밋은 flushPendingChanges()에서.
  pendingJsonSaves.set(file, JSON.parse(JSON.stringify(data)))
  return true
}

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function uploadImageNow(folder: ImageFolder, filename: string, file: Blob): Promise<string | null> {
  try {
    const dataUrl = await fileToDataUrl(file)
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ folder, filename, dataUrl }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as { ok: boolean; path?: string }
    if (!json.path) return null
    // Cache-bust: overwriting an existing filename (re-editing a photo) keeps the
    // same URL, so without this the browser just shows the old cached bytes.
    // Harmless to keep in the stored path too - static file servers ignore the query string.
    return `${json.path}?v=${Date.now()}`
  } catch {
    return null
  }
}

/** Uploads `file`, saved to public/<folder>/<filename>. Returns the public path (e.g. "/publications/pub12-1.jpg"). */
export async function uploadImage(folder: ImageFolder, filename: string, file: Blob): Promise<string | null> {
  if (isDev) return uploadImageNow(folder, filename, file)

  // 배포 환경: 즉시 올리지 않고, 화면 미리보기용 blob: URL을 바로 돌려줍니다.
  // 실제 업로드는 Save 누를 때 flushPendingChanges()에서 이 URL을 실제 경로로 바꿔치기합니다.
  const previewUrl = URL.createObjectURL(file)
  pendingUploads.set(previewUrl, { folder, filename, blob: file })
  return previewUrl
}

async function deleteImageNow(imagePath: string): Promise<boolean> {
  try {
    const res = await fetch('/api/delete-image', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ imagePath }),
    })
    return res.ok
  } catch {
    return false
  }
}

/** Deletes the file at the given public path (e.g. "/publications/pub12-1.jpg"). */
export async function deleteImage(imagePath: string): Promise<boolean> {
  if (isDev) return deleteImageNow(imagePath)

  if (pendingUploads.has(imagePath)) {
    // 아직 실제로 올라간 적 없는(pending) 파일이면, 큐에서 그냥 빼면 끝.
    URL.revokeObjectURL(imagePath)
    pendingUploads.delete(imagePath)
  } else if (imagePath.startsWith('/')) {
    pendingDeletes.add(imagePath)
  }
  return true
}

export interface GitPushResult {
  ok: boolean
  committed?: boolean
  step?: string
  output?: string
  error?: string
}

/** 로컬 dev 전용: 지금까지(즉시) 저장된 파일 변경사항을 git add/commit/push. */
export async function gitPush(message?: string): Promise<GitPushResult> {
  try {
    const res = await fetch('/api/git-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    return (await res.json()) as GitPushResult
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

/** JSON 데이터 안에서 blob: 미리보기 URL을 실제 업로드된 경로로 재귀적으로 바꿔치기합니다. */
function deepReplaceUrls(value: unknown, replacements: Map<string, string>): unknown {
  if (typeof value === 'string') return replacements.get(value) ?? value
  if (Array.isArray(value)) return value.map((v) => deepReplaceUrls(v, replacements))
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = deepReplaceUrls(v, replacements)
    return out
  }
  return value
}

export function hasPendingChanges(): boolean {
  return pendingJsonSaves.size > 0 || pendingUploads.size > 0 || pendingDeletes.size > 0
}

/**
 * 배포 환경 전용: 큐에 쌓아둔 이미지 업로드/삭제, JSON 저장을 전부 모아서
 * /api/commit-batch로 한 번에 보냅니다 - 서버가 GitHub Git Data API로 이걸
 * 전부 커밋 1개에 담아 push합니다 (파일마다 따로 커밋되지 않음).
 */
export async function flushPendingChanges(): Promise<GitPushResult> {
  if (isDev) return { ok: true, committed: false }
  if (!hasPendingChanges()) return { ok: true, committed: false }

  try {
    // 이미지의 최종 경로는 폴더+파일명으로 결정되는 값이라, 실제로 업로드하기 전에도
    // 미리 알 수 있습니다 - 그래서 JSON 쪽 blob: URL 치환을 먼저 끝낼 수 있습니다.
    const resolved = new Map<string, string>()
    const imagesPayload: { folder: ImageFolder; filename: string; dataUrl: string }[] = []
    const cacheBust = Date.now()

    for (const [previewUrl, item] of pendingUploads) {
      resolved.set(previewUrl, `/${item.folder}/${item.filename}?v=${cacheBust}`)
      const dataUrl = await fileToDataUrl(item.blob)
      imagesPayload.push({ folder: item.folder, filename: item.filename, dataUrl })
    }

    const jsonFilesPayload = Array.from(pendingJsonSaves.entries()).map(([file, data]) => ({
      file,
      data: resolved.size > 0 ? deepReplaceUrls(data, resolved) : data,
    }))

    const deletionsPayload = Array.from(pendingDeletes)

    const res = await fetch('/api/commit-batch', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ jsonFiles: jsonFilesPayload, images: imagesPayload, deletions: deletionsPayload }),
    })

    if (!res.ok) {
      const errJson = (await res.json().catch(() => ({}))) as { error?: string }
      return { ok: false, error: errJson.error ?? `HTTP ${res.status}` }
    }

    const json = (await res.json()) as GitPushResult

    if (json.ok) {
      for (const url of pendingUploads.keys()) URL.revokeObjectURL(url)
      pendingUploads.clear()
      pendingJsonSaves.clear()
      pendingDeletes.clear()
    }

    return json
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}
