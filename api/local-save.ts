import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isAuthorized, getClientIp, putFile } from './_github.js'

const ALLOWED_FILES = new Set(['members.json', 'news.json', 'publications.json', 'equipment.json'])

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
    const { file, data } = req.body as { file?: string; data?: unknown }

    if (!file || !ALLOWED_FILES.has(file)) {
      res.status(400).json({ ok: false, error: 'File not allowed' })
      return
    }

    const content = JSON.stringify(data, null, 2) + '\n'
    const base64 = Buffer.from(content, 'utf-8').toString('base64')

    await putFile(`src/data/${file}`, base64, `Update ${file} via admin panel (from ${getClientIp(req)})`)

    res.status(200).json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) })
  }
}
