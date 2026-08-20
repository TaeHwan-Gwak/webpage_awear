<template>
  <li class="news-item">
    <div class="meta">
      <span v-if="index" class="idx">No.{{ index }}</span>
      <span v-if="tag" class="tag">{{ tag }}</span>
      <time class="date">{{ date }}</time>
    </div>
    <div class="body">
      <img v-if="image" :src="image" alt="" loading="lazy" class="photo" />
      <p class="desc">
        {{ desc }}
        <a v-if="link" :href="link" target="_blank" rel="noopener" class="link">[Link]</a>
      </p>
    </div>
  </li>
</template>

<script setup lang="ts">
defineProps<{
  date: string
  desc: string
  tag?: string
  link?: string
  image?: string
  index?: number
}>()
</script>

<style src="./styles/NewsItem.css" scoped></style>
