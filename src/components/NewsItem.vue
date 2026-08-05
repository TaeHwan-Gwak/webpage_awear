<template>
  <li class="news-item">
    <div class="meta">
      <span v-if="tag" class="tag">{{ tag }}</span>
      <time class="date">{{ date }}</time>
    </div>
    <p class="desc">{{ desc }}</p>
  </li>
</template>

<script setup lang="ts">
defineProps<{
  date: string
  desc: string
  tag?: string
}>()
</script>

<style src="./styles/NewsItem.css" scoped></style>
