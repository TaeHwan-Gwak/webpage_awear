<template>
  <li class="news-item">
    <div class="meta">
      <span v-if="index" class="idx">No.{{ index }}</span>
      <time class="date">{{ date }}</time>
    </div>
    <div class="body">
      <p class="desc">
        {{ desc }}
        <a v-if="link" :href="link" target="_blank" rel="noopener" class="link">[Link]</a>
      </p>
      <div v-if="images?.length" class="photos">
        <img v-for="(src, i) in images" :key="src + i" :src="src" :alt="desc" loading="lazy" class="photo" />
      </div>
      <slot />
    </div>
  </li>
</template>

<script setup lang="ts">
defineProps<{
  date: string
  desc: string
  tag?: string
  link?: string
  images?: string[]
  index?: number
}>()
</script>

<style src="./styles/NewsItem.css" scoped></style>
