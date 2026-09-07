import { computed, ref } from 'vue'
import {
  DUMMY_ADMIN_PAYLOAD,
  DUMMY_SIGNATURE,
  TOKEN_TTL_SECONDS,
  type AdminTokenPayload,
} from '../data/dummyAdminToken'
import {
  acquireLock,
  cancelRequest,
  getSessionId,
  heartbeat,
  holdsLock,
  releaseLock,
  requestAccess,
  type AccessRequest,
  type SessionLock,
} from '../services/adminSession'

const STORAGE_KEY = 'awear-admin-token'

/** Name shown to whoever is waiting for the session. Becomes the account name under Supabase. */
const ADMIN_LABEL = 'Admin'

/* ------------------------------------------------------------------ *
 * base64url
 * atob/btoa only speak plain base64, so the -/_ and padding differences
 * are handled by hand.
 * ------------------------------------------------------------------ */

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/* ------------------------------------------------------------------ *
 * Issuing and reading tokens
 * ------------------------------------------------------------------ */

/** Mints a dummy token with iat/exp set to now. */
function issueToken(): string {
  const now = Math.floor(Date.now() / 1000)
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = toBase64Url(
    JSON.stringify({
      ...DUMMY_ADMIN_PAYLOAD,
      iat: now,
      exp: now + TOKEN_TTL_SECONDS,
    } satisfies AdminTokenPayload),
  )
  return `${header}.${payload}.${DUMMY_SIGNATURE}`
}

/**
 * Parses a token, returning null when the shape or signature is wrong.
 * The signature check is meaningless while the signature is a constant -
 * this is where a real verification call goes once the backend exists.
 */
function decodeToken(token: string): AdminTokenPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  if (parts[2] !== DUMMY_SIGNATURE) return null

  try {
    const payload = JSON.parse(fromBase64Url(parts[1])) as AdminTokenPayload
    if (payload.role !== 'admin') return null
    if (typeof payload.exp !== 'number') return null
    return payload
  } catch {
    return null
  }
}

function isExpired(payload: AdminTokenPayload): boolean {
  return payload.exp * 1000 <= Date.now()
}

/* ------------------------------------------------------------------ *
 * Session state
 * ------------------------------------------------------------------ */

const token = ref<string | null>(sessionStorage.getItem(STORAGE_KEY))

function setToken(next: string | null) {
  token.value = next
  if (next) sessionStorage.setItem(STORAGE_KEY, next)
  else sessionStorage.removeItem(STORAGE_KEY)
}

/** Payload of the current token, or null when there is none or it is malformed. */
export const adminPayload = computed(() => (token.value ? decodeToken(token.value) : null))

/**
 * The real check. Comparing exp depends on Date.now(), which is not reactive,
 * so wrapping this in a computed would cache a stale "still valid" answer until
 * the token itself changes. Gates must call this and recompute every time.
 */
function hasValidSession(): boolean {
  const payload = adminPayload.value
  return payload !== null && !isExpired(payload)
}

/**
 * Reactive flag for enabling the edit/add/delete buttons.
 * Display only - a frame of staleness is fine here because the gates below
 * do the actual blocking.
 */
export const canEditAdmin = computed(() => {
  const payload = adminPayload.value
  return payload !== null && !isExpired(payload)
})

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

export function isAdminAuthenticated(): boolean {
  return hasValidSession()
}

/** Whether a token was present at all, expired or not, so we know to explain why it ended. */
export function hasAdminToken(): boolean {
  return token.value !== null
}

export function getAdminToken(): string | null {
  return hasValidSession() ? token.value : null
}

/**
 * Why a login attempt failed.
 * 'locked' means the password was right but another admin holds the session -
 * only then can access be requested. Checking the password first keeps people
 * who do not know it from spamming requests.
 */
export type LoginResult =
  | { ok: true }
  | { ok: false; reason: 'no-password-configured' }
  | { ok: false; reason: 'bad-password' }
  | { ok: false; reason: 'locked'; heldBy: SessionLock }

export function loginAdmin(password: string): LoginResult {
  const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD

  if (!correctPassword) {
    console.warn('[admin] VITE_ADMIN_PASSWORD is not set in .env.')
    return { ok: false, reason: 'no-password-configured' }
  }

  if (password !== correctPassword) {
    return { ok: false, reason: 'bad-password' }
  }

  const lock = acquireLock(getSessionId(), ADMIN_LABEL)
  if (!lock.ok) {
    return { ok: false, reason: 'locked', heldBy: lock.heldBy }
  }

  setToken(issueToken())
  return { ok: true }
}

/**
 * Finishes signing in after a request was approved and the lock already moved
 * to this tab. The password was verified before the request went out.
 */
export function completeLoginAfterHandover(): boolean {
  const acquired = acquireLock(getSessionId(), ADMIN_LABEL)
  if (!acquired.ok) return false

  setToken(issueToken())
  return true
}

export function logoutAdmin(): void {
  setToken(null)
  // Dropping the token but keeping the lock would shut the next admin out for LOCK_STALE_MS.
  releaseLock(getSessionId())
}

/** Asks the current holder to hand the session over. Wrapped here to keep the label in one place. */
export function requestAdminAccess(): AccessRequest {
  return requestAccess(getSessionId(), ADMIN_LABEL)
}

export function cancelAdminAccessRequest(): void {
  cancelRequest(getSessionId())
}

/**
 * Keeps the token from expiring while the admin area stays open.
 * An already expired token is not revived.
 */
export function renewAdminToken(): void {
  if (!hasValidSession()) return
  setToken(issueToken())
}

/**
 * Why a session ended, so the login screen can say the right thing.
 * - expired  : the token ran out
 * - handover : we approved a request and gave the session away
 */
export type SessionCheck = 'ok' | 'expired' | 'handover'

/**
 * The gate for the router guard and for every save/add/delete.
 * Passing it also refreshes the expiry and the heartbeat.
 */
export function requireAdminSession(): SessionCheck {
  if (!hasValidSession()) {
    logoutAdmin()
    return 'expired'
  }

  // The token can still be valid after the session was handed to someone else.
  if (!holdsLock(getSessionId())) {
    setToken(null)
    return 'handover'
  }

  renewAdminToken()
  heartbeat(getSessionId())
  return 'ok'
}
