<template>
  <div class="admin-shell">
    <header class="admin-topbar">
      <span class="brand">AWEAR Lab · Admin</span>
      <button class="logout" @click="onLogout">로그아웃</button>
    </header>

    <main class="admin-body">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { logoutAdmin } from '../../composables/useAdminAuth'

const router = useRouter()

function onLogout() {
  logoutAdmin()
  router.replace('/admin/login')
}
</script>

<style src="./styles/AdminLayout.css" scoped></style>
