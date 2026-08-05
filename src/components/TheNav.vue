<template>
  <header class="nav" :class="{ scrolled }">
    <div class="nav-inner">
      <router-link to="/" class="brand">
        <img src="/logo.webp" alt="AWEAR Lab - AI-based WEArable Robotics Lab" class="logo" />
      </router-link>

      <nav class="links" aria-label="주요 메뉴">
        <router-link v-for="item in items" :key="item.to" :to="item.to">{{ item.label }}</router-link>
      </nav>

      <router-link class="cta" to="/internship">인턴 지원</router-link>

      <button class="burger" :aria-expanded="open" aria-label="메뉴 열기" @click="open = !open">
        <span /><span /><span />
      </button>
    </div>

    <transition name="drop">
      <nav v-if="open" class="mobile-links" aria-label="주요 메뉴 (모바일)">
        <router-link v-for="item in items" :key="item.to" :to="item.to" @click="open = false">{{ item.label }}</router-link>
        <router-link class="cta" to="/internship" @click="open = false">인턴 지원</router-link>
      </nav>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const open = ref(false)
const scrolled = ref(false)

const items = [
  { label: 'Research', to: '/research' },
  { label: 'Publications', to: '/publications' },
  { label: 'Member', to: '/member' },
  { label: 'Internship', to: '/internship' },
  { label: 'News', to: '/news' },
  { label: 'Contact', to: '/contact' },
]

function onScroll() {
  scrolled.value = window.scrollY > 12
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style src="./styles/TheNav.css" scoped></style>
