import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isAuthorized, getClientIp, putFile } from './_github.js'

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
    const { folder, filename, dataUrl } = req.body as {
      folder?: string
      filename?: string
      dataUrl?: string
    }

    if (!folder || !ALLOWED_IMAGE_FOLDERS.has(folder)) {
      res.status(400).json({ ok: false, error: 'Folder not allowed' })
      return
    }

    const safeName = filename ? safeFilename(filename) : null
    if (!safeName) {
      res.status(400).json({ ok: false, error: 'Invalid filename' })
      return
    }

    const match = /^data:.+;base64,(.+)$/.exec(dataUrl ?? '')
    if (!match) {
      res.status(400).json({ ok: false, error: 'Invalid image data' })
      return
    }

    await putFile(
      `public/${folder}/${safeName}`,
      match[1],
      `Upload ${folder}/${safeName} via admin panel (from ${getClientIp(req)})`
    )

    res.status(200).json({ ok: true, path: `/${folder}/${safeName}` })
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) })
  }
}
