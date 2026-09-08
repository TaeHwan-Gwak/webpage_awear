// middleware.ts (최상위 루트)

// ==========================================
// [설정] IP 제한 활성화 여부
// false: 누구나 /admin 접속 가능 (현재 상태)
// true : 아래 허용 목록에 있는 IP만 접속 가능
// ==========================================
const ENABLE_IP_RESTRICTION = false

const EXACT_IPS: string[] = [
  // '123.45.67.89',
]

const ALLOWED_SUBNET_PREFIXES: string[] = [
  // '143.248.50.',
]

export default function middleware(req: Request) {
  // IP 제한이 꺼져 있으면 다음 처리로 그냥 통과
  if (!ENABLE_IP_RESTRICTION) {
    return
  }

  const url = new URL(req.url)

  if (url.pathname.startsWith('/admin')) {
    const rawIp = req.headers.get('x-forwarded-for') || ''
    const clientIp = rawIp.split(',')[0].trim()

    const isExactMatch = EXACT_IPS.includes(clientIp)
    const isSubnetMatch = ALLOWED_SUBNET_PREFIXES.some((prefix) => clientIp.startsWith(prefix))

    if (!isExactMatch && !isSubnetMatch) {
      return Response.redirect(new URL('/', req.url))
    }
  }

  // 허용된 경우 정상 통과
  return
}

export const config = {
  matcher: ['/admin/:path*'],
}