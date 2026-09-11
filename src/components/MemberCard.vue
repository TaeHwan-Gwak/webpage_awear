<template>
  <article class="member-card" :class="{ 'admin-mode': isAdmin }" @mouseenter="onEnter" @mouseleave="onLeave">
    <div class="avatar" aria-hidden="true">
      <img v-if="photo" :src="photo" alt="" class="avatar-photo" />
      <span v-else class="ph-label">Image</span>
    </div>
    <h3>{{ name }}</h3>
    <p class="role">{{ role }}</p>
    <p class="note">{{ note }}</p>

    <div v-if="showSpinner" class="hover-spinner" aria-hidden="true" />

    <div class="info-panel" :class="{ visible: showInfo }">
      <p v-if="email" class="info-email">{{ email }}</p>
      <p v-if="interests" class="info-interests">{{ interests }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useAdminMode } from '../composables/useAdminMode'

defineProps<{
  name: string
  role: string
  note?: string
  email?: string
  interests?: string
  photo?: string
}>()

const { isAdmin } = useAdminMode()

const SPINNER_DELAY = 500
const INFO_DELAY = 1500

const showSpinner = ref(false)
const showInfo = ref(false)
let spinnerTimer: ReturnType<typeof setTimeout> | undefined
let infoTimer: ReturnType<typeof setTimeout> | undefined

function onEnter() {
  if (isAdmin.value) return

  spinnerTimer = setTimeout(() => {
    showSpinner.value = true
  }, SPINNER_DELAY)

  infoTimer = setTimeout(() => {
    showSpinner.value = false
    showInfo.value = true
  }, INFO_DELAY)
}

function onLeave() {
  if (spinnerTimer) clearTimeout(spinnerTimer)
  if (infoTimer) clearTimeout(infoTimer)
  showSpinner.value = false
  showInfo.value = false
}

onBeforeUnmount(() => {
  if (spinnerTimer) clearTimeout(spinnerTimer)
  if (infoTimer) clearTimeout(infoTimer)
})
</script>

<style src="./styles/MemberCard.css" scoped></style>
