<template>
  <div class="hero-carousel">
    <img
      v-for="(src, i) in images"
      v-show="!failed[i]"
      :key="src"
      :src="src"
      class="slide"
      :class="{ active: i === current }"
      :alt="`AWEAR Lab photo ${i + 1}`"
      @error="onError(i)"
    />

    <div v-if="allFailed" class="fallback" aria-hidden="true">
      <span class="ph-label">Image</span>
    </div>

    <div class="dots" role="tablist" aria-label="Select image">
      <button
        v-for="(src, i) in images"
        :key="src"
        class="dot"
        :class="{ active: i === current }"
        role="tab"
        :aria-selected="i === current"
        :aria-label="`View image ${i + 1}`"
        @click="select(i)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  images: string[]
}>()

const INTERVAL_MS = 5000

const current = ref(0)
const failed = reactive<Record<number, boolean>>({})
const allFailed = computed(() => props.images.every((_, i) => failed[i]))
let timer: ReturnType<typeof setInterval> | undefined

function next() {
  current.value = (current.value + 1) % props.images.length
}

function restart() {
  if (timer) clearInterval(timer)
  timer = setInterval(next, INTERVAL_MS)
}

function select(i: number) {
  current.value = i
  restart()
}

function onError(i: number) {
  failed[i] = true
}

onMounted(restart)
onUnmounted(() => timer && clearInterval(timer))
</script>

<style src="./styles/HeroCarousel.css" scoped></style>
