<template>
  <div class="layered-image">
    <img v-for="(layer, i) in layers" :key="i" :src="layer.src" :alt="alt"
      :fetchpriority="priority ? 'high' : 'auto'" :style="{
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
  /** Marks these layers' images as fetchpriority="high" - use for the first item in a grid only. */
  priority?: boolean
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
