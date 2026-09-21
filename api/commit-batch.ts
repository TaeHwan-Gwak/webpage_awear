import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isAuthorized, getClientIp, commitBatch } from './_github.js'

const ALLOWED_FILES = new Set(['members.json', 'news.json', 'publications.json', 'equipment.json'])
const ALLOWED_IMAGE_FOLDERS = new Set(['publications', 'member', 'news', 'equipment'])

function safeFilename(name: string): string | null {
  if (!/^[\w.-]+$/.test(name)) return null
  if (name.includes('..')) return null
  return name
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }

  if (!isAuthorized(req)) {
    res.status(401).json({ ok: false, error: 'Unauthorized' })
    return
  }

  try {
    const {
      jsonFiles = [],
      images = [],
      deletions = [],
    } = req.body as {
      jsonFiles?: { file: string; data: unknown }[]
      images?: { folder: string; filename: string; dataUrl: string }[]
      deletions?: string[]
    }

    const files: { path: string; base64Content: string }[] = []

    for (const { file, data } of jsonFiles) {
      if (!ALLOWED_FILES.has(file)) continue
      const content = JSON.stringify(data, null, 2) + '\n'
      files.push({ path: `src/data/${file}`, base64Content: Buffer.from(content, 'utf-8').toString('base64') })
    }

    for (const { folder, filename, dataUrl } of images) {
      if (!ALLOWED_IMAGE_FOLDERS.has(folder)) continue
      const safeName = safeFilename(filename)
      if (!safeName) continue
      const match = /^data:.+;base64,(.+)$/.exec(dataUrl)
      if (!match) continue
      files.push({ path: `public/${folder}/${safeName}`, base64Content: match[1] })
    }

    const validDeletions = deletions
      .filter((p) => {
        const folder = p.split('/')[1]
        return ALLOWED_IMAGE_FOLDERS.has(folder)
      })
      .map((p) => `public${p}`)

    const commitSha = await commitBatch(
      files,
      validDeletions,
      `Update content via admin panel (from ${getClientIp(req)})`
    )

    res.status(200).json({ ok: true, committed: commitSha !== null })
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) })
  }
}
