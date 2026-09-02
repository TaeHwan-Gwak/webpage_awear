<template>
  <div class="admin-shell">
    <header class="admin-topbar">
      <span class="brand">AWEAR Lab · Admin</span>
      <nav class="admin-nav">
        <!-- <RouterLink to="/admin" exact-active-class="active">대시보드</RouterLink> -->
        <RouterLink to="/admin/members" active-class="active">멤버 관리</RouterLink>
      </nav>
      <button class="logout" @click="onLogout">로그아웃</button>
    </header>

    <main class="admin-body">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { logoutAdmin } from '../../composables/useAdminAuth'

const router = useRouter()

function onLogout() {
  logoutAdmin()
  router.replace('/')
}
</script>

<style src="./styles/AdminLayout.css" scoped></style>
