<template>
  <li class="pub-item" @mouseenter="onEnter" @mouseleave="onLeave">
    <span class="year">{{ year }}</span>
    <div class="body">
      <span v-if="theme" class="theme-tag">{{ theme }}</span>
      <h3>{{ title }}</h3>
      <p class="authors">{{ authors }}</p>
      <p class="venue">{{ venue }}</p>
    </div>

    <transition name="pop">
      <div v-if="showSummary" class="summary-card">
        <p class="summary-eyebrow">Summary</p>
        <h4>[]</h4>
        <p class="summary-desc">[]</p>
        <ul class="summary-points">
          <li>[]</li>
          <li>[]</li>
          <li>[]</li>
        </ul>
      </div>
    </transition>
  </li>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'

defineProps<{
  year: string
  title: string
  authors: string
  venue: string
  theme?: string
}>()

// 2초 이상 마우스를 올리고 있으면 요약 카드를 보여줍니다.
const HOVER_DELAY = 2000

const showSummary = ref(false)
let hoverTimer: ReturnType<typeof setTimeout> | undefined

function onEnter() {
  hoverTimer = setTimeout(() => {
    showSummary.value = true
  }, HOVER_DELAY)
}

function onLeave() {
  if (hoverTimer) clearTimeout(hoverTimer)
  showSummary.value = false
}

onBeforeUnmount(() => {
  if (hoverTimer) clearTimeout(hoverTimer)
})
</script>

<style src="./styles/PublicationItem.css" scoped></style>
