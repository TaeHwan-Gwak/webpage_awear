import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import type { Plugin, Connect } from 'vite'

const ALLOWED_FILES = new Set(['members.json', 'news.json', 'publications.json', 'equipment.json'])
const ALLOWED_IMAGE_FOLDERS = new Set(['publications', 'member', 'news', 'equipment'])

function getClientIp(req: Connect.IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress ?? 'unknown'
}

function logAction(logFile: string, ip: string, line: string) {
  try {
    fs.mkdirSync(path.dirname(logFile), { recursive: true })
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] [${ip}] ${line}\n`, 'utf-8')
  } catch {
    // 로그 기록 실패가 실제 요청을 막으면 안 되므로 조용히 무시합니다.
  }
}

function handleLocalSave(dataDir: string, logFile: string): Connect.NextHandleFunction {
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
      const ip = getClientIp(req)
      res.setHeader('Content-Type', 'application/json')
      try {
        const { file, data } = JSON.parse(body) as { file?: string; data?: unknown }

        if (!file || !ALLOWED_FILES.has(file)) {
          logAction(logFile, ip, `SAVE rejected - file not allowed (${file ?? 'missing'})`)
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, error: 'File not allowed' }))
          return
        }

        const target = path.join(dataDir, file)
        fs.writeFileSync(target, JSON.stringify(data, null, 2) + '\n', 'utf-8')
        logAction(logFile, ip, `SAVE ${file}`)
        res.statusCode = 200
        res.end(JSON.stringify({ ok: true }))
      } catch (e) {
        logAction(logFile, ip, `SAVE error - ${String(e)}`)
        res.statusCode = 500
        res.end(JSON.stringify({ ok: false, error: String(e) }))
      }
    })
  }
}

function safeFilename(name: string): string | null {
  // Only a plain filename (letters, numbers, dot, dash, underscore) - no slashes, no "..".
  if (!/^[\w.-]+$/.test(name)) return null
  if (name.includes('..')) return null
  return name
}

function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => resolve(body))
  })
}

function handleImageUpload(publicDir: string, logFile: string): Connect.NextHandleFunction {
  return (req, res, next) => {
    if (req.url !== '/api/upload-image') {
      next()
      return
    }
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.end('Method not allowed')
      return
    }

    readBody(req).then((body) => {
      const ip = getClientIp(req)
      res.setHeader('Content-Type', 'application/json')
      try {
        const { folder, filename, dataUrl } = JSON.parse(body) as {
          folder?: string
          filename?: string
          dataUrl?: string
        }

        if (!folder || !ALLOWED_IMAGE_FOLDERS.has(folder)) {
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, error: 'Folder not allowed' }))
          return
        }

        const safeName = filename ? safeFilename(filename) : null
        if (!safeName) {
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, error: 'Invalid filename' }))
          return
        }

        const match = /^data:.+;base64,(.+)$/.exec(dataUrl ?? '')
        if (!match) {
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, error: 'Invalid image data' }))
          return
        }

        const folderPath = path.join(publicDir, folder)
        fs.mkdirSync(folderPath, { recursive: true })
        const filePath = path.join(folderPath, safeName)
        fs.writeFileSync(filePath, Buffer.from(match[1], 'base64'))

        logAction(logFile, ip, `UPLOAD ${folder}/${safeName}`)
        res.statusCode = 200
        res.end(JSON.stringify({ ok: true, path: `/${folder}/${safeName}` }))
      } catch (e) {
        logAction(logFile, ip, `UPLOAD error - ${String(e)}`)
        res.statusCode = 500
        res.end(JSON.stringify({ ok: false, error: String(e) }))
      }
    })
  }
}

function handleImageDelete(publicDir: string, logFile: string): Connect.NextHandleFunction {
  return (req, res, next) => {
    if (req.url !== '/api/delete-image') {
      next()
      return
    }
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.end('Method not allowed')
      return
    }

    readBody(req).then((body) => {
      const ip = getClientIp(req)
      res.setHeader('Content-Type', 'application/json')
      try {
        const { imagePath: rawImagePath } = JSON.parse(body) as { imagePath?: string }
        const imagePath = rawImagePath?.split('?')[0]

        if (!imagePath || imagePath.includes('..') || !imagePath.startsWith('/')) {
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, error: 'Invalid path' }))
          return
        }

        const [, folder] = imagePath.split('/')
        if (!ALLOWED_IMAGE_FOLDERS.has(folder)) {
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, error: 'Folder not allowed' }))
          return
        }

        const target = path.join(publicDir, imagePath)
        const existed = fs.existsSync(target)
        if (existed) fs.unlinkSync(target)

        logAction(logFile, ip, `DELETE ${imagePath}${existed ? '' : ' (already gone)'}`)
        res.statusCode = 200
        res.end(JSON.stringify({ ok: true }))
      } catch (e) {
        logAction(logFile, ip, `DELETE error - ${String(e)}`)
        res.statusCode = 500
        res.end(JSON.stringify({ ok: false, error: String(e) }))
      }
    })
  }
}

function run(cmd: string, cwd: string): Promise<{ ok: boolean; output: string }> {
  return new Promise((resolve) => {
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      const output = [stdout, stderr].filter(Boolean).join('\n').trim()
      resolve({ ok: !error, output })
    })
  })
}

function handleGitPush(projectRoot: string, logFile: string): Connect.NextHandleFunction {
  return (req, res, next) => {
    if (req.url !== '/api/git-push') {
      next()
      return
    }
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.end('Method not allowed')
      return
    }

    readBody(req).then(async (body) => {
      const ip = getClientIp(req)
      res.setHeader('Content-Type', 'application/json')
      try {
        const { message } = JSON.parse(body || '{}') as { message?: string }
        const commitMessage = (message && message.trim()) || `Update content via admin panel (${new Date().toISOString()})`

        const add = await run('git add -A', projectRoot)
        if (!add.ok) {
          logAction(logFile, ip, `GIT-PUSH failed at add - ${add.output}`)
          res.statusCode = 500
          res.end(JSON.stringify({ ok: false, step: 'add', output: add.output }))
          return
        }

        const commit = await run(`git commit -m ${JSON.stringify(commitMessage)}`, projectRoot)
        // "nothing to commit" isn't a real failure - everything was already committed.
        const nothingToCommit = /nothing to commit/i.test(commit.output)
        if (!commit.ok && !nothingToCommit) {
          logAction(logFile, ip, `GIT-PUSH failed at commit - ${commit.output}`)
          res.statusCode = 500
          res.end(JSON.stringify({ ok: false, step: 'commit', output: commit.output }))
          return
        }

        const push = await run('git push', projectRoot)
        if (!push.ok) {
          logAction(logFile, ip, `GIT-PUSH failed at push - ${push.output}`)
          res.statusCode = 500
          res.end(JSON.stringify({ ok: false, step: 'push', output: push.output }))
          return
        }

        logAction(logFile, ip, `GIT-PUSH ok${nothingToCommit ? ' (nothing to commit)' : ` - "${commitMessage}"`}`)
        res.statusCode = 200
        res.end(
          JSON.stringify({
            ok: true,
            committed: !nothingToCommit,
            output: [add.output, commit.output, push.output].filter(Boolean).join('\n'),
          })
        )
      } catch (e) {
        logAction(logFile, ip, `GIT-PUSH error - ${String(e)}`)
        res.statusCode = 500
        res.end(JSON.stringify({ ok: false, error: String(e) }))
      }
    })
  }
}

export function localSavePlugin(): Plugin {
  const dataDir = path.resolve(process.cwd(), 'src/data')
  const publicDir = path.resolve(process.cwd(), 'public')
  const projectRoot = process.cwd()
  const logFile = path.resolve(process.cwd(), 'logs/admin-activity.log')

  return {
    name: 'local-save-plugin',
    configureServer(server) {
      server.middlewares.use(handleLocalSave(dataDir, logFile))
      server.middlewares.use(handleImageUpload(publicDir, logFile))
      server.middlewares.use(handleImageDelete(publicDir, logFile))
      server.middlewares.use(handleGitPush(projectRoot, logFile))
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleLocalSave(dataDir, logFile))
      server.middlewares.use(handleImageUpload(publicDir, logFile))
      server.middlewares.use(handleImageDelete(publicDir, logFile))
      server.middlewares.use(handleGitPush(projectRoot, logFile))
    },
  }
}
