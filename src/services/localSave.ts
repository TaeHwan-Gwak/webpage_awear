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

export async function saveJsonFile(file: SavableFile, data: unknown): Promise<boolean> {
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

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/** Uploads `file`, saved to public/<folder>/<filename>. Returns the public path (e.g. "/publications/pub12-1.jpg"). */
export async function uploadImage(
  folder: ImageFolder,
  filename: string,
  file: Blob
): Promise<string | null> {
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

/** Deletes the file at the given public path (e.g. "/publications/pub12-1.jpg"). */
export async function deleteImage(imagePath: string): Promise<boolean> {
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

export interface GitPushResult {
  ok: boolean
  committed?: boolean
  step?: string
  output?: string
  error?: string
}

/** Commits whatever's currently changed in the project and pushes it (git add -A && commit && push). */
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
