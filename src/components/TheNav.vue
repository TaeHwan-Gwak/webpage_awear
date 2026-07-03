<template>
  <header class="nav" :class="{ scrolled }">
    <div class="nav-inner">
      <a href="#top" class="brand">
        <svg class="mark" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M4 24 L11 8 L16 20 L21 8 L28 24" />
        </svg>
        <span class="brand-text">
          <strong>AWEAR</strong>
          <em>Lab</em>
        </span>
      </a>

      <nav class="links" aria-label="주요 섹션">
        <a v-for="item in items" :key="item.href" :href="item.href">{{ item.label }}</a>
      </nav>

      <a class="cta" href="#join">인턴 지원</a>

      <button class="burger" :aria-expanded="open" aria-label="메뉴 열기" @click="open = !open">
        <span /><span /><span />
      </button>
    </div>

    <transition name="drop">
      <nav v-if="open" class="mobile-links" aria-label="주요 섹션 (모바일)">
        <a v-for="item in items" :key="item.href" :href="item.href" @click="open = false">{{ item.label }}</a>
        <a class="cta" href="#join" @click="open = false">인턴 지원</a>
      </nav>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const open = ref(false)
const scrolled = ref(false)

const items = [
  { label: '연구실 소개', href: '#mission' },
  { label: '연구 분야', href: '#research' },
  { label: '소식', href: '#news' },
  { label: '지도교수', href: '#pi' },
  { label: '연락처', href: '#join' },
]

function onScroll() {
  scrolled.value = window.scrollY > 12
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style src="./styles/TheNav.css" scoped></style>
