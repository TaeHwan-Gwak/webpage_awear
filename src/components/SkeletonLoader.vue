<template>
  <span class="skeleton" :class="{ circle }" :style="dims" aria-hidden="true" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  width?: string
  height?: string
  radius?: string
  circle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '1em',
  radius: '6px',
  circle: false,
})

const dims = computed(() => ({
  width: props.width,
  height: props.height,
  borderRadius: props.circle ? '50%' : props.radius,
}))
</script>

<style src="./styles/SkeletonLoader.css" scoped></style>
