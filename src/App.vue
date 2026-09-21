<template>
  <TheNav v-if="!isAdminRoute" />
  <router-view />
  <TheFooter v-if="!isAdminRoute" />
  <ScrollToTopButton v-if="!isAdminRoute" />
  <Analytics />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Analytics } from '@vercel/analytics/vue'
import TheNav from './components/TheNav.vue'
import TheFooter from './components/TheFooter.vue'
import ScrollToTopButton from './components/ScrollToTopButton.vue'
import { hasPendingChanges } from './services/localSave'

const route = useRoute()
const isAdminRoute = computed(() => route.path === '/admin/login')

// 배포 환경에서 Save(GitHub 커밋)를 안 누른 채로 탭을 닫거나 새로고침하면
// 큐에 쌓아둔 변경사항이 그대로 사라지므로, 브라우저 기본 경고를 띄워줍니다.
function onBeforeUnload(e: BeforeUnloadEvent) {
  if (hasPendingChanges()) e.preventDefault()
}

onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
onUnmounted(() => window.removeEventListener('beforeunload', onBeforeUnload))
</script>
