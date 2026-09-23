<template>
  <div class="layered-image">
    <img v-for="(layer, i) in layers" :key="i" :src="layer.src" :alt="alt" loading="lazy" :style="{
      left: `${layer.x * 100}%`,
      top: `${layer.y * 100}%`,
      width: `${layer.width * 100}%`,
      height: `${layer.height * 100}%`,
    }" />
  </div>
</template>

<script setup lang="ts">
export interface ImageLayer {
  src: string
  x: number
  y: number
  width: number
  height: number
}

defineProps<{
  layers: ImageLayer[]
  alt?: string
}>()
</script>

<style scoped>
.layered-image {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.layered-image img {
  position: absolute;
}
</style>
