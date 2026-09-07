/**
 * Single-admin session lock, plus the "request access -> approve" handshake.
 *
 * [Limits of the dummy implementation]
 * State lives in localStorage, so this only coordinates tabs of the *same*
 * browser. Blocking a second admin on another machine needs shared server
 * state and only becomes real once Supabase is wired up. localStorage is also
 * user-editable, so treat this lock as traffic control rather than security.
 *
 * [Moving to Supabase]
 * Swap readLock/writeLock/readRequest/writeRequest for table access and replace
 * subscribe() with a Realtime subscription; the rest of the logic carries over.
 * Two single-row tables are enough: admin_session and admin_access_request.
 */

const LOCK_KEY = 'awear-admin-lock'
const REQUEST_KEY = 'awear-admin-request'
const SESSION_ID_KEY = 'awear-admin-session-id'

/** How often the lock holder announces it is still alive. */
export const HEARTBEAT_MS = 5_000
/** Reclaim the lock after this much silence, so a crashed browser cannot hold it forever. */
export const LOCK_STALE_MS = 30_000
/** Give up on an unanswered access request after this long. */
export const REQUEST_TIMEOUT_MS = 60_000
/** storage events only fire for *other* tabs, so poll as well to catch same-tab writes. */
export const POLL_MS = 1_000

export interface SessionLock {
  sessionId: string
  /** Shown on the login screen. Becomes the account name once Supabase lands. */
  label: string
  acquiredAt: number
  lastSeenAt: number
}

export interface AccessRequest {
  requestId: string
  requesterId: string
  requesterLabel: string
  requestedAt: number
  status: 'pending' | 'accepted' | 'rejected'
}

/* ---------------- Storage access (the Supabase swap point) ---------------- */

function read<T>(key: string): T | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

function write(key: string, value: unknown | null): void {
  if (value === null) localStorage.removeItem(key)
  else localStorage.setItem(key, JSON.stringify(value))
}

const readLock = () => read<SessionLock>(LOCK_KEY)
const writeLock = (lock: SessionLock | null) => write(LOCK_KEY, lock)
const readRequest = () => read<AccessRequest>(REQUEST_KEY)
const writeRequest = (req: AccessRequest | null) => write(REQUEST_KEY, req)

/* ---------------- Tab identity ---------------- */

/**
 * crypto.randomUUID() only exists in a secure context (https or localhost).
 * Opening a `vite --host` LAN address such as http://192.168.x.x would throw.
 * This id only distinguishes tabs, so a weaker fallback is fine.
 */
function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** One per tab. Kept in sessionStorage so it survives a reload but not a new tab. */
export function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_ID_KEY)
  if (!id) {
    id = newId()
    sessionStorage.setItem(SESSION_ID_KEY, id)
  }
  return id
}

/* ---------------- The lock ---------------- */

function isStale(lock: SessionLock): boolean {
  return Date.now() - lock.lastSeenAt > LOCK_STALE_MS
}

/** Returns the lock only while it is alive, clearing it once the heartbeat stops. */
export function getActiveLock(): SessionLock | null {
  const lock = readLock()
  if (!lock) return null
  if (isStale(lock)) {
    writeLock(null)
    writeRequest(null)
    return null
  }
  return lock
}

export function holdsLock(sessionId: string): boolean {
  return getActiveLock()?.sessionId === sessionId
}

/** Takes the lock, or fails and reports who is holding it. */
export function acquireLock(
  sessionId: string,
  label: string,
): { ok: true } | { ok: false; heldBy: SessionLock } {
  const current = getActiveLock()

  if (current && current.sessionId !== sessionId) {
    return { ok: false, heldBy: current }
  }

  const now = Date.now()
  writeLock({
    sessionId,
    label,
    acquiredAt: current?.acquiredAt ?? now,
    lastSeenAt: now,
  })
  return { ok: true }
}

/**
 * Announces that this tab is still here. Returns false once the lock is gone,
 * and the caller must sign out immediately when that happens.
 */
export function heartbeat(sessionId: string): boolean {
  const lock = getActiveLock()
  if (!lock || lock.sessionId !== sessionId) return false

  writeLock({ ...lock, lastSeenAt: Date.now() })
  return true
}

/** Releases only our own lock, so we never clear the one we just handed over. */
export function releaseLock(sessionId: string): void {
  const lock = readLock()
  if (!lock || lock.sessionId !== sessionId) return

  writeLock(null)

  // Nobody is left to answer a pending request, so drop it too.
  const req = readRequest()
  if (req?.status === 'pending') writeRequest(null)
}

/* ---------------- Access requests ---------------- */

function isRequestExpired(req: AccessRequest): boolean {
  return req.status === 'pending' && Date.now() - req.requestedAt > REQUEST_TIMEOUT_MS
}

export function getActiveRequest(): AccessRequest | null {
  const req = readRequest()
  if (!req) return null
  if (isRequestExpired(req)) {
    writeRequest(null)
    return null
  }
  return req
}

/** Asks the admin who is signed in to hand the session over. */
export function requestAccess(sessionId: string, label: string): AccessRequest {
  const req: AccessRequest = {
    requestId: newId(),
    requesterId: sessionId,
    requesterLabel: label,
    requestedAt: Date.now(),
    status: 'pending',
  }
  writeRequest(req)
  return req
}

export function cancelRequest(sessionId: string): void {
  const req = readRequest()
  if (req?.requesterId === sessionId) writeRequest(null)
}

/**
 * Approves the request and moves the lock to the requester.
 * The previous holder's next heartbeat() then returns false and signs them out.
 */
export function acceptRequest(holderSessionId: string): boolean {
  const lock = getActiveLock()
  const req = getActiveRequest()
  if (!lock || lock.sessionId !== holderSessionId) return false
  if (!req || req.status !== 'pending') return false

  const now = Date.now()
  writeLock({
    sessionId: req.requesterId,
    label: req.requesterLabel,
    acquiredAt: now,
    lastSeenAt: now,
  })
  writeRequest({ ...req, status: 'accepted' })
  return true
}

export function rejectRequest(holderSessionId: string): boolean {
  const lock = getActiveLock()
  const req = getActiveRequest()
  if (!lock || lock.sessionId !== holderSessionId) return false
  if (!req || req.status !== 'pending') return false

  writeRequest({ ...req, status: 'rejected' })
  return true
}

/** Clears the request once the requester has seen the outcome. */
export function clearRequest(): void {
  writeRequest(null)
}

/* ---------------- Change detection ---------------- */

/**
 * Calls back whenever the lock or the pending request changes.
 * storage events only cover other tabs, so a poll runs alongside them.
 * Replace this whole function with a Realtime subscription under Supabase.
 */
export function subscribe(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === LOCK_KEY || e.key === REQUEST_KEY || e.key === null) onChange()
  }

  window.addEventListener('storage', onStorage)
  const timer = setInterval(onChange, POLL_MS)

  return () => {
    window.removeEventListener('storage', onStorage)
    clearInterval(timer)
  }
}
