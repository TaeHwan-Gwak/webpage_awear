import type { VercelRequest, VercelResponse } from '@vercel/node'

// ==========================================
// [설정] IP 허용 목록 - middleware.ts의 목록과 같은 개념입니다.
// 코드를 바꾸는 방식이라 값 수정 시 재배포가 필요합니다.
// ==========================================
const EXACT_IPS: string[] = [
  // '123.45.67.89',
]

const ALLOWED_SUBNET_PREFIXES: string[] = [
  // '143.248.50.',
]

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) return forwarded.split(',')[0].trim()
  if (Array.isArray(forwarded) && forwarded.length > 0) return forwarded[0]
  return 'unknown'
}

function isIpAllowed(ip: string): boolean {
  if (EXACT_IPS.includes(ip)) return true
  return ALLOWED_SUBNET_PREFIXES.some((prefix) => ip.startsWith(prefix))
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, reason: 'method-not-allowed' })
    return
  }

  try {
    const { password } = req.body as { password?: string }
    if (!password) {
      res.status(400).json({ ok: false, reason: 'bad-password' })
      return
    }

    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD
    const adminPassword = process.env.VITE_ADMIN_PASSWORD

    // superAdmin(교수님용)은 IP 상관없이 항상 통과.
    if (superAdminPassword && password === superAdminPassword) {
      res.status(200).json({ ok: true, role: 'superAdmin' })
      return
    }

    // 일반 admin은 비밀번호 맞아도 IP까지 허용 목록에 있어야 통과.
    if (adminPassword && password === adminPassword) {
      const ip = getClientIp(req)
      if (isIpAllowed(ip)) {
        res.status(200).json({ ok: true, role: 'admin' })
      } else {
        res.status(403).json({ ok: false, reason: 'ip-blocked' })
      }
      return
    }

    res.status(401).json({ ok: false, reason: 'bad-password' })
  } catch (e) {
    res.status(500).json({ ok: false, reason: 'error', error: String(e) })
  }
}
