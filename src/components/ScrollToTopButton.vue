<template>
  <transition name="fade">
    <button v-if="visible" type="button" class="scroll-top-btn" aria-label="Back to top" @click="scrollToTop">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const SHOW_AFTER_PX = 400

const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > SHOW_AFTER_PX
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style src="./styles/ScrollToTopButton.css" scoped></style>
