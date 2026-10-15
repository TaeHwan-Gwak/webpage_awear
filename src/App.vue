<template>
  <TheNav v-if="!isAdminRoute && !isGateRoute" />
  <router-view />
  <TheFooter v-if="!isAdminRoute && !isGateRoute" />
  <ScrollToTopButton v-if="!isAdminRoute && !isGateRoute" />
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
// 체스판 그리드 프로토타입(6안)은 실제 사이트 nav/footer 없이 전체 화면을 덮는
// 커버 페이지라서 홈처럼 chrome을 숨깁니다. 1안(인트로 게이트)은 이제 홈 페이지
// 맨 위에 들어갈 "섹션"으로 바뀌었으므로 일반 페이지처럼 nav/footer를 보여줍니다.
const GATE_ROUTES = new Set(['/proto/checkerboard-grid'])
const isGateRoute = computed(() => GATE_ROUTES.has(route.path))

// 배포 환경에서 Save(GitHub 커밋)를 안 누른 채로 탭을 닫거나 새로고침하면
// 큐에 쌓아둔 변경사항이 그대로 사라지므로, 브라우저 기본 경고를 띄워줍니다.
function onBeforeUnload(e: BeforeUnloadEvent) {
  if (hasPendingChanges()) e.preventDefault()
}

onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
onUnmounted(() => window.removeEventListener('beforeunload', onBeforeUnload))
</script>
