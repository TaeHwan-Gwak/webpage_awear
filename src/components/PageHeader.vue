<template>
  <header class="page-header section">
    <p class="eyebrow">{{ eyebrow }}</p>
    <h1>{{ title }}</h1>
    <p v-if="description" class="desc">{{ description }}</p>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description?: string
}>()
</script>

<style src="./styles/PageHeader.css" scoped></style>
