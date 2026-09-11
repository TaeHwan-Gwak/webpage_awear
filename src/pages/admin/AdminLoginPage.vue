<template>
  <main class="admin-login">
    <form class="panel" @submit.prevent="onSubmit">
      <p class="eyebrow">AWEAR Lab</p>
      <h1>Admin</h1>

      <label class="field">
        <span>Password</span>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          autofocus
          :disabled="phase === 'requesting'"
          @input="onInput"
        />
      </label>

      <p v-if="notice" class="notice">{{ notice }}</p>
      <p v-if="error" class="error">Incorrect password.</p>

      <template v-if="phase === 'locked' || phase === 'rejected'">
        <p class="error">
          Another admin is signed in.
          <span v-if="heldSince" class="sub">Since {{ heldSince }}</span>
        </p>
        <p v-if="phase === 'rejected'" class="error">Your access request was rejected.</p>
        <button type="button" class="btn" @click="onRequestAccess">Request access</button>
      </template>

      <template v-else-if="phase === 'requesting'">
        <p class="notice">
          Access requested. Waiting for the signed-in admin to approve.
          <span class="sub">Expires in {{ secondsLeft }}s.</span>
        </p>
        <button type="button" class="btn ghost" @click="onCancelRequest">Cancel request</button>
      </template>

      <button v-else type="submit" class="btn">Enter</button>
    </form>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  cancelAdminAccessRequest,
  completeLoginAfterHandover,
  loginAdmin,
  requestAdminAccess,
} from '../../composables/useAdminAuth'
import {
  REQUEST_TIMEOUT_MS,
  clearRequest,
  getActiveLock,
  getActiveRequest,
  getSessionId,
  subscribe,
} from '../../services/adminSession'

/*
 * Screen phases
 *   idle       - the normal state: type the password and enter
 *   locked     - password was right, but another admin holds the session
 *   requesting - an access request is out, waiting for approval
 *   rejected   - the request was turned down
 */
type Phase = 'idle' | 'locked' | 'requesting' | 'rejected'

const route = useRoute()
const router = useRouter()
const sessionId = getSessionId()

const password = ref('')
const error = ref(false)
const notice = ref('')
const phase = ref<Phase>('idle')
const lockedSince = ref<number | null>(null)
const requestDeadline = ref<number | null>(null)
const now = ref(Date.now())

let unsubscribe: (() => void) | undefined

const heldSince = computed(() =>
  lockedSince.value === null
    ? ''
    : new Date(lockedSince.value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
)

const secondsLeft = computed(() =>
  requestDeadline.value === null
    ? 0
    : Math.max(0, Math.ceil((requestDeadline.value - now.value) / 1000)),
)

function onInput() {
  error.value = false
  notice.value = ''
}

function enterAdmin() {
  const redirect = (route.query.redirect as string) || '/'
  router.replace(redirect)
}

/** Tries the password, and moves to the request flow when the seat is taken. */
function tryEnter() {
  const result = loginAdmin(password.value)

  if (result.ok) {
    enterAdmin()
    return
  }

  if (result.reason === 'bad-password') {
    error.value = true
    return
  }

  if (result.reason === 'no-password-configured') {
    notice.value = 'No admin password is configured. Check .env.local.'
    return
  }

  phase.value = 'locked'
  lockedSince.value = result.heldBy.acquiredAt
}

function onSubmit() {
  tryEnter()
}

function onRequestAccess() {
  const req = requestAdminAccess()
  phase.value = 'requesting'
  requestDeadline.value = req.requestedAt + REQUEST_TIMEOUT_MS
  notice.value = ''
}

function onCancelRequest() {
  cancelAdminAccessRequest()
  phase.value = 'locked'
  requestDeadline.value = null
}

/** Reads the lock and request state and moves the screen along. Driven by poll and storage events. */
function syncState() {
  now.value = Date.now()

  if (phase.value === 'requesting') {
    const req = getActiveRequest()

    // The request is gone: it timed out, or the holder signed out and cleared it.
    if (!req || req.requesterId !== sessionId) {
      phase.value = 'locked'
      requestDeadline.value = null
      notice.value = 'No response, so the request expired. You can ask again.'
      return
    }

    if (req.status === 'accepted') {
      clearRequest()
      requestDeadline.value = null
      // The lock already moved to this tab; only the token is missing.
      if (completeLoginAfterHandover()) enterAdmin()
      else {
        phase.value = 'locked'
        notice.value = 'Could not take over the session. Please try again.'
      }
      return
    }

    if (req.status === 'rejected') {
      clearRequest()
      requestDeadline.value = null
      phase.value = 'rejected'
    }
    return
  }

  // Not waiting on anything: walk straight in once the seat frees up.
  // The password was already verified to get here.
  if (phase.value === 'locked' || phase.value === 'rejected') {
    if (getActiveLock() === null) {
      notice.value = ''
      tryEnter()
    }
  }
}

onMounted(() => {
  // The router guard attaches a reason when it sends someone back here.
  const reason = route.query.reason
  if (reason === 'expired') notice.value = 'Your session expired. Please sign in again.'
  else if (reason === 'handover') notice.value = 'You handed the session to another admin.'

  unsubscribe = subscribe(syncState)
})

onUnmounted(() => {
  unsubscribe?.()
  // Leaving a request behind would strand the other admin with a banner nobody answers.
  if (phase.value === 'requesting') cancelAdminAccessRequest()
})
</script>

<style src="./styles/AdminLoginPage.css" scoped></style>
