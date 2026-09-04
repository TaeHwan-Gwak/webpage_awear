<template>
  <div class="admin-shell">
    <header class="admin-topbar">
      <span class="brand">AWEAR Lab · Admin</span>
      <nav class="admin-nav">
        <!-- <RouterLink to="/admin" exact-active-class="active">Dashboard</RouterLink> -->
        <RouterLink to="/admin/members" active-class="active">members</RouterLink>
        <RouterLink to="/admin/publications" active-class="active">publications</RouterLink>
        <RouterLink to="/admin/news" active-class="active">news</RouterLink>
        <RouterLink to="/admin/equipment" active-class="active">equipment</RouterLink>
      </nav>
      <button class="logout" @click="onLogout">Logout</button>
    </header>

    <div v-if="pendingRequest" class="access-request" role="alert">
      <p class="request-text">
        <strong>{{ pendingRequest.requesterLabel }}</strong> is asking for admin access.
        <span class="warn">Approving signs you out right away, and unsaved changes are lost.</span>
      </p>
      <div class="request-actions">
        <button type="button" class="reject" @click="onReject">Reject</button>
        <button type="button" class="accept" @click="onAccept">Approve</button>
      </div>
    </div>

    <main class="admin-body">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { logoutAdmin, renewAdminToken } from '../../composables/useAdminAuth'
import {
  HEARTBEAT_MS,
  acceptRequest,
  getActiveRequest,
  getSessionId,
  heartbeat,
  rejectRequest,
  subscribe,
  type AccessRequest,
} from '../../services/adminSession'

/*
 * This component wraps every /admin route. Moving between the admin pages only
 * swaps what is inside <router-view>, so AdminLayout stays mounted; it unmounts
 * only when you leave /admin/* entirely. That makes this the one place that
 * knows about "entering" and "leaving" the admin area, so it owns:
 *   1) the heartbeat, which holds the session and keeps the token fresh
 *   2) watching for access requests, and taking approve/reject
 *   3) dropping the token and releasing the lock on unmount
 */

const router = useRouter()
const sessionId = getSessionId()

const pendingRequest = ref<AccessRequest | null>(null)

let heartbeatTimer: ReturnType<typeof setInterval> | undefined
let unsubscribe: (() => void) | undefined

function stopWatching() {
  clearInterval(heartbeatTimer)
  heartbeatTimer = undefined
  unsubscribe?.()
  unsubscribe = undefined
}

function syncRequest() {
  const req = getActiveRequest()
  pendingRequest.value = req?.status === 'pending' ? req : null
}

/** Shared exit path. The lock already belongs to someone else, so logoutAdmin() leaves it alone. */
function leaveAdmin() {
  stopWatching()
  logoutAdmin()
  router.replace({ path: '/admin/login', query: { reason: 'handover' } })
}

function onHeartbeat() {
  // Losing the lock means the session was handed over or reclaimed.
  if (!heartbeat(sessionId)) {
    leaveAdmin()
    return
  }
  renewAdminToken()
}

function onAccept() {
  // If approving fails the request expired or was cancelled; just refresh the banner.
  if (!acceptRequest(sessionId)) {
    syncRequest()
    return
  }
  leaveAdmin()
}

function onReject() {
  rejectRequest(sessionId)
  syncRequest()
}

function onLogout() {
  stopWatching()
  logoutAdmin()
  router.replace('/')
}

onMounted(() => {
  syncRequest()
  heartbeatTimer = setInterval(onHeartbeat, HEARTBEAT_MS)
  unsubscribe = subscribe(syncRequest)
})

onUnmounted(() => {
  stopWatching()
  logoutAdmin()
})
</script>

<style src="./styles/AdminLayout.css" scoped></style>
