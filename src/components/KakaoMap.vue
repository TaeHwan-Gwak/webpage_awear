<template>
  <div class="kakao-map">
    <div ref="mapEl" class="map-el" :class="{ hidden: !ready }" />

    <div v-if="!ready" class="placeholder" aria-hidden="true">
      <span v-if="error === 'not-configured'" class="ph-label">
        지도 영역 — VITE_KAKAO_MAP_KEY 설정 필요
      </span>
      <span v-else-if="error" class="ph-label">지도를 불러오지 못했습니다</span>
      <span v-else class="ph-label">지도 불러오는 중…</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKakaoMap } from '../composables/useKakaoMap'

const props = defineProps<{
  address: string
}>()

const mapEl = ref<HTMLElement | null>(null)
const { ready, error } = useKakaoMap(mapEl, props.address)
</script>

<style src="./styles/KakaoMap.css" scoped></style>
