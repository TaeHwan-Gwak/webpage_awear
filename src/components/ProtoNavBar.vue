<template>
  <nav class="proto-bar" aria-label="Prototype switcher">
    <span class="proto-bar-label">PROTOTYPE</span>
    <RouterLink
      v-for="opt in options"
      :key="opt.path"
      :to="opt.path"
      class="proto-bar-link"
      :class="{ active: route.path === opt.path }"
    >
      {{ opt.label }}
    </RouterLink>
    <RouterLink to="/" class="proto-bar-link exit">실제 홈으로 ↩</RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const options = [
  { path: '/proto/intro-gate', label: '1. Intro Gate' },
  { path: '/proto/home-video', label: '2. Home 섹션' },
  { path: '/proto/equipment-video', label: '3. Equipment 데모' },
  { path: '/proto/research-video', label: '4. Research 토글' },
  { path: '/proto/media-page', label: '5. Media 페이지' },
  { path: '/proto/checkerboard-grid', label: '6. 체스판 그리드' },
]
</script>

<style scoped>
.proto-bar {
  position: sticky;
  top: 0;
  z-index: 70;
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  padding: 10px 16px;
  background: var(--text);
  white-space: nowrap;
}

.proto-bar-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
  margin-right: 4px;
  flex-shrink: 0;
}

.proto-bar-link {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-family: var(--font-mono);
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.08);
  transition: background 0.15s ease, color 0.15s ease;
}

.proto-bar-link:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

.proto-bar-link.active {
  background: var(--orange);
  color: #fff;
}

.proto-bar-link.exit {
  margin-left: auto;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.25);
}
</style>
