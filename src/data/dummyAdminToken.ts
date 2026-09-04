/**
 * Dummy JWT used until a real auth backend (Supabase) is wired up.
 *
 * It has the same three-part `header.payload.signature` base64url shape as a real
 * JWT, so the payload decodes normally. The signature is a fixed string though,
 * so it is never verified - this cannot stop forgery on its own.
 * Once the backend exists, delete this file and use the token the login API returns.
 */

/** Session lifetime in seconds. Drop it to ~10 while testing the expiry flow. */
export const TOKEN_TTL_SECONDS = 30 * 60

export interface AdminTokenPayload {
  sub: string
  name: string
  role: 'admin'
  /** Issued at, in seconds since the UNIX epoch. */
  iat: number
  /** Expires at, in seconds since the UNIX epoch. */
  exp: number
}

/**
 * One token as the server might have handed it over.
 * Its iat is 2026-01-01T00:00:00Z and exp is 30 minutes later, so it is already
 * expired - paste it into sessionStorage to exercise the expiry path by hand.
 */
export const DUMMY_ADMIN_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJhZG1pbiIsIm5hbWUiOiJBV0VBUiBMYWIgQWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjcyMjU2MDAsImV4cCI6MTc2NzIyNzQwMH0.' +
  'YXdlYXItbGFiLWR1bW15LXNpZ25hdHVyZQ'

/** Payload template. Login reissues it with iat/exp set to the current time. */
export const DUMMY_ADMIN_PAYLOAD: AdminTokenPayload = {
  sub: 'admin',
  name: 'AWEAR Lab Admin',
  role: 'admin',
  iat: 1767225600,
  exp: 1767227400,
}

/** Placeholder signature shared by every dummy token until the backend lands. */
export const DUMMY_SIGNATURE = 'YXdlYXItbGFiLWR1bW15LXNpZ25hdHVyZQ'
