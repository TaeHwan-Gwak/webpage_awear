export type SavableFile = 'members.json' | 'news.json' | 'publications.json' | 'equipment.json'
export type ImageFolder = 'publications' | 'member' | 'news' | 'equipment'

export async function saveJsonFile(file: SavableFile, data: unknown): Promise<boolean> {
  try {
    const res = await fetch('/api/local-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, data }),
    })
    return res.ok
  } catch {
    return false
  }
}

function fileToDataUrl(file: File): Promise<string> {
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
  file: File
): Promise<string | null> {
  try {
    const dataUrl = await fileToDataUrl(file)
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder, filename, dataUrl }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as { ok: boolean; path?: string }
    return json.path ?? null
  } catch {
    return null
  }
}

/** Deletes the file at the given public path (e.g. "/publications/pub12-1.jpg"). */
export async function deleteImage(imagePath: string): Promise<boolean> {
  try {
    const res = await fetch('/api/delete-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagePath }),
    })
    return res.ok
  } catch {
    return false
  }
}
