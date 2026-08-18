<template>
  <header class="nav">
    <div class="nav-inner">
      <router-link to="/" class="brand" @click="onBrandClick">
        <img src="/logo.webp" alt="AWEAR Lab - AI-based WEArable Robotics Lab" class="logo" />
      </router-link>

      <nav class="links" aria-label="주요 메뉴">
        <div
          v-for="item in items"
          :key="item.to"
          class="nav-item"
          @mouseenter="openDropdown(item.to)"
          @mouseleave="closeDropdown"
        >
          <router-link :to="item.to" @click="closeDropdown">{{ item.label }}</router-link>

          <div
            v-if="item.children"
            class="dropdown"
            :class="{ 'is-open': activeDropdown === item.to }"
          >
            <router-link
              v-for="child in item.children"
              :key="child.to"
              :to="child.to"
              class="dropdown-item"
              @click="onSubItemClick"
            >
              {{ child.label }}
            </router-link>
          </div>
        </div>
      </nav>

      <button class="burger" :aria-expanded="open" aria-label="메뉴 열기" @click="open = !open">
        <span /><span /><span />
      </button>
    </div>

    <transition name="drop">
      <nav v-if="open" class="mobile-links" aria-label="주요 메뉴 (모바일)">
        <template v-for="item in items" :key="item.to">
          <router-link :to="item.to" @click="open = false">{{ item.label }}</router-link>
          <router-link
            v-for="child in item.children"
            :key="child.to"
            :to="child.to"
            class="mobile-sub"
            @click="open = false"
          >
            {{ child.label }}
          </router-link>
        </template>
      </nav>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const open = ref(false)

const activeDropdown = ref<string | null>(null)

const openDropdown = (key: string) => {
  activeDropdown.value = key
}

const closeDropdown = () => {
  activeDropdown.value = null
}

const onSubItemClick = (e: MouseEvent) => {
  closeDropdown()
  const target = e.currentTarget as HTMLElement | null
  target?.blur()
}

const items = [
  {
    label: 'Research',
    to: '/research',
    children: [
      { label: 'BCI / 뉴럴인터페이스', to: '/research#topic-1' },
      { label: '로봇 및 의수', to: '/research#topic-2' },
      { label: 'AI 및 비전', to: '/research#topic-3' },
    ],
  },
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