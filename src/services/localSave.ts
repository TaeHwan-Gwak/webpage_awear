export type SavableFile = 'members.json' | 'news.json' | 'publications.json' | 'equipment.json'

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
