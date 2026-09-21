import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isAuthorized, getClientIp, deleteFile } from './_github.js'

const ALLOWED_IMAGE_FOLDERS = new Set(['publications', 'member', 'news', 'equipment'])

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
    const { imagePath: rawImagePath } = req.body as { imagePath?: string }
    const imagePath = rawImagePath?.split('?')[0]

    if (!imagePath || imagePath.includes('..') || !imagePath.startsWith('/')) {
      res.status(400).json({ ok: false, error: 'Invalid path' })
      return
    }

    const [, folder] = imagePath.split('/')
    if (!ALLOWED_IMAGE_FOLDERS.has(folder)) {
      res.status(400).json({ ok: false, error: 'Folder not allowed' })
      return
    }

    await deleteFile(`public${imagePath}`, `Delete ${imagePath} via admin panel (from ${getClientIp(req)})`)

    res.status(200).json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) })
  }
}
