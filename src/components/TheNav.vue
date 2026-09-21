<template>
  <header class="nav">
    <div class="nav-inner">
      <router-link to="/" class="brand" @click="onBrandClick">
        <img src="/logo.webp" alt="AWEAR Lab - AI-based WEArable Robotics Lab" class="logo" />
      </router-link>

      <nav class="links" aria-label="Main menu">
        <div v-for="item in items" :key="item.to" class="nav-item" @mouseenter="openDropdown(item.to)"
          @mouseleave="closeDropdown">
          <router-link :to="item.to" @click="closeDropdown">{{ item.label }}</router-link>

          <div v-if="item.children" class="dropdown" :class="{ 'is-open': activeDropdown === item.to }">
            <router-link v-for="child in item.children" :key="child.to" :to="child.to" class="dropdown-item"
              @click="onSubItemClick">
              {{ child.label }}
            </router-link>
          </div>
        </div>
      </nav>

      <div v-if="isAdmin" class="admin-actions">
        <span v-if="pushResult" class="push-result" :class="{ error: !pushResult.ok }">{{ pushResult.message }}</span>
        <button type="button" class="save-btn" :disabled="pushing" @click="onSave">
          {{ pushing ? 'Pushing…' : 'Save' }}
        </button>
        <button type="button" class="logout-btn" @click="onLogout">Logout</button>
      </div>

      <button class="burger" :aria-expanded="open" aria-label="Open menu" @click="open = !open">
        <span /><span /><span />
      </button>
    </div>

    <transition name="drop">
      <nav v-if="open" class="mobile-links" aria-label="Main menu (mobile)">
        <template v-for="item in items" :key="item.to">
          <router-link :to="item.to" @click="open = false">{{ item.label }}</router-link>
          <router-link v-for="child in item.children" :key="child.to" :to="child.to" class="mobile-sub"
            @click="open = false">
            {{ child.label }}
          </router-link>
        </template>
        <div v-if="isAdmin" class="admin-actions mobile">
          <span v-if="pushResult" class="push-result" :class="{ error: !pushResult.ok }">{{ pushResult.message }}</span>
          <button type="button" class="save-btn mobile" :disabled="pushing" @click="onSave">
            {{ pushing ? 'Pushing…' : 'Save' }}
          </button>
          <button type="button" class="logout-btn mobile" @click="onLogout">Logout</button>
        </div>
      </nav>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminMode } from '../composables/useAdminMode'
import { logoutAdmin } from '../composables/useAdminAuth'
import { gitPush, flushPendingChanges, hasPendingChanges } from '../services/localSave'

const route = useRoute()
const router = useRouter()
const open = ref(false)
const { isAdmin, refresh } = useAdminMode()
const isDev = import.meta.env.DEV

function onLogout() {
  if (hasPendingChanges()) {
    const proceed = window.confirm(
      "You have unsaved changes that haven't been pushed yet. Log out anyway? They'll be lost."
    )
    if (!proceed) return
  }

  logoutAdmin()
  refresh()
  open.value = false
  router.push('/')
}

const pushing = ref(false)
const pushResult = ref<{ ok: boolean; message: string } | null>(null)

async function onSave() {
  pushing.value = true
  pushResult.value = null

  const result = isDev ? await gitPush() : await flushPendingChanges()
  pushing.value = false

  pushResult.value = result.ok
    ? { ok: true, message: result.committed ? 'Pushed to GitHub ✓' : 'Nothing to push' }
    : {
        ok: false,
        message: `Push failed${result.step ? ` (${result.step})` : ''}.${isDev ? ' Is the local dev server running?' : ''}`,
      }

  setTimeout(() => {
    pushResult.value = null
  }, 6000)
}

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

const baseItems = [
  { label: 'Home', to: '/' },
  {
    label: 'Research',
    to: '/research',
    children: [
      { label: 'BCI / Neural Interface', to: '/research#topic-1' },
      { label: 'Robotics & Prosthetics', to: '/research#topic-2' },
      { label: 'AI & Vision', to: '/research#topic-3' },
    ],
  },
  { label: 'Publications', to: '/publication' },
  { label: 'Member', to: '/member' },
  { label: 'News', to: '/news' },
  { label: 'Equipment', to: '/equipment' },
  { label: 'Contact', to: '/contact' },
]

// admin일 때만 맨 끝에 통계 탭이 붙습니다.
const items = computed(() => (isAdmin.value ? [...baseItems, { label: 'Stats', to: '/admin/stats' }] : baseItems))

function onBrandClick(e: MouseEvent) {
  if (route.path !== '/') return
  e.preventDefault()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style src="./styles/TheNav.css" scoped></style>