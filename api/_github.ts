// GitHub Contents API 호출을 위한 공용 헬퍼. api/*.ts 함수들이 공유해서 씁니다.
// (Vercel은 이런 "_" 접두사 helper 파일을 별도 라우트로 배포하지 않고,
//  그냥 import하는 함수에 번들링만 해줍니다.)

const GITHUB_API = 'https://api.github.com'

function env(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

function repoConfig() {
  return {
    owner: env('GITHUB_OWNER'),
    repo: env('GITHUB_REPO'),
    branch: process.env.GITHUB_BRANCH || 'main',
    token: env('GITHUB_TOKEN'),
  }
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

/** Checks the admin password sent by the client against the same value used for client-side login. */
export function isAuthorized(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  const expected = process.env.VITE_ADMIN_PASSWORD
  const provided = req.headers['x-admin-password']
  return typeof expected === 'string' && expected.length > 0 && provided === expected
}

/** Best-effort client IP, for including in commit messages so history shows who did what. */
export function getClientIp(req: { headers: Record<string, string | string[] | undefined> }): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) return forwarded.split(',')[0].trim()
  if (Array.isArray(forwarded) && forwarded.length > 0) return forwarded[0]
  return 'unknown'
}

/** Fetches a file's current sha (needed to update/delete it), or null if it doesn't exist yet. */
export async function getFileSha(path: string): Promise<string | null> {
  const { owner, repo, branch, token } = repoConfig()
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`,
    { headers: headers(token) }
  )
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status} ${await res.text()}`)
  const json = (await res.json()) as { sha: string }
  return json.sha
}

/** Creates or updates a file with the given base64 content, committing directly to the branch. */
export async function putFile(path: string, base64Content: string, message: string): Promise<void> {
  const { owner, repo, branch, token } = repoConfig()
  const sha = await getFileSha(path)

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: base64Content,
      branch,
      ...(sha ? { sha } : {}),
    }),
  })

  if (!res.ok) throw new Error(`GitHub PUT ${path} failed: ${res.status} ${await res.text()}`)
}

/** Deletes a file. No-ops (does not throw) if the file doesn't exist. */
export async function deleteFile(path: string, message: string): Promise<void> {
  const { owner, repo, branch, token } = repoConfig()
  const sha = await getFileSha(path)
  if (!sha) return // already gone

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
    method: 'DELETE',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sha, branch }),
  })

  if (!res.ok) throw new Error(`GitHub DELETE ${path} failed: ${res.status} ${await res.text()}`)
}
