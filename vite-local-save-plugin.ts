import fs from 'node:fs'
import path from 'node:path'
import type { Plugin, Connect } from 'vite'

const ALLOWED_FILES = new Set(['members.json', 'news.json', 'publications.json', 'equipment.json'])

function handleLocalSave(dataDir: string): Connect.NextHandleFunction {
  return (req, res, next) => {
    if (req.url !== '/api/local-save') {
      next()
      return
    }
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.end('Method not allowed')
      return
    }

    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json')
      try {
        const { file, data } = JSON.parse(body) as { file?: string; data?: unknown }

        if (!file || !ALLOWED_FILES.has(file)) {
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, error: 'File not allowed' }))
          return
        }

        const target = path.join(dataDir, file)
        fs.writeFileSync(target, JSON.stringify(data, null, 2) + '\n', 'utf-8')
        res.statusCode = 200
        res.end(JSON.stringify({ ok: true }))
      } catch (e) {
        res.statusCode = 500
        res.end(JSON.stringify({ ok: false, error: String(e) }))
      }
    })
  }
}

export function localSavePlugin(): Plugin {
  const dataDir = path.resolve(process.cwd(), 'src/data')

  return {
    name: 'local-save-plugin',
    configureServer(server) {
      server.middlewares.use(handleLocalSave(dataDir))
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleLocalSave(dataDir))
    },
  }
}
