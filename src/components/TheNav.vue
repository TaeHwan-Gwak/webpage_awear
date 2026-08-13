<template>
  <header class="nav">
    <div class="nav-inner">
      <router-link to="/" class="brand" @click="onBrandClick">
        <img src="/logo.webp" alt="AWEAR Lab - AI-based WEArable Robotics Lab" class="logo" />
      </router-link>

      <nav class="links" aria-label="주요 메뉴">
        <router-link v-for="item in items" :key="item.to" :to="item.to">{{ item.label }}</router-link>
      </nav>

      <button class="burger" :aria-expanded="open" aria-label="메뉴 열기" @click="open = !open">
        <span /><span /><span />
      </button>
    </div>

    <transition name="drop">
      <nav v-if="open" class="mobile-links" aria-label="주요 메뉴 (모바일)">
        <router-link v-for="item in items" :key="item.to" :to="item.to" @click="open = false">{{ item.label }}</router-link>
      </nav>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const open = ref(false)

const items = [
  { label: 'Research', to: '/research' },
  { label: 'Publications', to: '/publications' },
  { label: 'Member', to: '/member' },
  { label: 'News', to: '/news' },
  { label: 'Contact', to: '/contact' },
]

function onBrandClick(e: MouseEvent) {
  if (route.path !== '/') return
  e.preventDefault()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style src="./styles/TheNav.css" scoped></style>
