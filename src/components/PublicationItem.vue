<template>
  <li class="pub-item" @mouseenter="onEnter" @mouseleave="onLeave">
    <span class="year">{{ year }}</span>
    <div class="body">
      <div v-if="images && images.length" class="thumbs">
        <img v-for="(src, i) in images" :key="i" :src="src" alt="" loading="lazy" />
      </div>
      <span v-if="theme" class="theme-tag">{{ theme }}</span>
      <h3>
        <a v-if="link" :href="link" target="_blank" rel="noopener">{{ title }}</a>
        <template v-else>{{ title }}</template>
      </h3>
      <p class="authors">{{ authors }}</p>
      <p class="venue">{{ venue }}</p>
    </div>

    <!-- <transition name="pop">
      <div v-if="showSummary" class="summary-card">
        <p class="summary-eyebrow">Summary</p>
        <h4>논문 제목</h4>
        <p class="summary-desc">요약 설명</p>
        <ul class="summary-points">
          <li>핵심 내용</li>
          <li>핵심 내용</li>
          <li>핵심 내용</li>
        </ul>
      </div>
    </transition> -->
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
  link?: string
  images?: string[]
}>()

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
