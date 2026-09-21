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

/* ------------------------------------------------------------------ *
 * Git Data API - lets several file changes land in exactly ONE commit
 * (the old Contents API approach always made one commit per file, which
 * is why it's not used anymore - see commitBatch below).
 * ------------------------------------------------------------------ */

async function getBranchHeadSha(): Promise<string> {
  const { owner, repo, branch, token } = repoConfig()
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers: headers(token) })
  if (!res.ok) throw new Error(`GitHub GET ref failed: ${res.status} ${await res.text()}`)
  const json = (await res.json()) as { object: { sha: string } }
  return json.object.sha
}

async function getCommitTreeSha(commitSha: string): Promise<string> {
  const { owner, repo, token } = repoConfig()
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/commits/${commitSha}`, { headers: headers(token) })
  if (!res.ok) throw new Error(`GitHub GET commit failed: ${res.status} ${await res.text()}`)
  const json = (await res.json()) as { tree: { sha: string } }
  return json.tree.sha
}

async function createBlob(base64Content: string): Promise<string> {
  const { owner, repo, token } = repoConfig()
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/blobs`, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: base64Content, encoding: 'base64' }),
  })
  if (!res.ok) throw new Error(`GitHub create blob failed: ${res.status} ${await res.text()}`)
  const json = (await res.json()) as { sha: string }
  return json.sha
}

async function createTree(baseTreeSha: string, entries: { path: string; sha: string | null }[]): Promise<string> {
  const { owner, repo, token } = repoConfig()
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: entries.map((e) => ({ path: e.path, mode: '100644', type: 'blob', sha: e.sha })),
    }),
  })
  if (!res.ok) throw new Error(`GitHub create tree failed: ${res.status} ${await res.text()}`)
  const json = (await res.json()) as { sha: string }
  return json.sha
}

async function createCommitObject(treeSha: string, parentSha: string, message: string): Promise<string> {
  const { owner, repo, token } = repoConfig()
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, tree: treeSha, parents: [parentSha] }),
  })
  if (!res.ok) throw new Error(`GitHub create commit failed: ${res.status} ${await res.text()}`)
  const json = (await res.json()) as { sha: string }
  return json.sha
}

async function updateBranchRef(commitSha: string): Promise<void> {
  const { owner, repo, branch, token } = repoConfig()
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ sha: commitSha }),
  })
  if (!res.ok) throw new Error(`GitHub update ref failed: ${res.status} ${await res.text()}`)
}

/**
 * Writes/updates `files` and removes `deletions`, all landing in a single commit
 * that gets pushed to the branch head. Returns the new commit sha, or null if
 * there was nothing to do.
 */
export async function commitBatch(
  files: { path: string; base64Content: string }[],
  deletions: string[],
  message: string
): Promise<string | null> {
  if (files.length === 0 && deletions.length === 0) return null

  const headSha = await getBranchHeadSha()
  const baseTreeSha = await getCommitTreeSha(headSha)

  const entries: { path: string; sha: string | null }[] = []
  for (const file of files) {
    const sha = await createBlob(file.base64Content)
    entries.push({ path: file.path, sha })
  }
  for (const path of deletions) {
    entries.push({ path, sha: null })
  }

  const newTreeSha = await createTree(baseTreeSha, entries)
  const newCommitSha = await createCommitObject(newTreeSha, headSha, message)
  await updateBranchRef(newCommitSha)

  return newCommitSha
}
