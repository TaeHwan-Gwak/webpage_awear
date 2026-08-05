<template>
  <main class="publications-page">
    <PageHeader eyebrow="Publications" title="[]" description="[]" />

    <section class="filters section">
      <div class="chip-row">
        <button
          class="chip"
          :class="{ active: activeTheme === null }"
          @click="activeTheme = null"
        >
          전체
        </button>
        <button
          v-for="theme in themes"
          :key="theme"
          class="chip"
          :class="{ active: activeTheme === theme }"
          @click="activeTheme = theme"
        >
          {{ theme }}
        </button>
      </div>
    </section>

    <section class="list section">
      <ul>
        <PublicationItem
          v-for="(pub, i) in filteredPublications"
          :key="i"
          :year="pub.year"
          :title="pub.title"
          :authors="pub.authors"
          :venue="pub.venue"
          :theme="pub.theme"
        />
      </ul>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import PublicationItem from '../components/PublicationItem.vue'

const publications = Array.from({ length: 6 }, () => ({
  year: '[]',
  title: '[]',
  authors: '[]',
  venue: '[]',
  theme: '[]',
}))

// 테마 칩은 논문 목록에 실제로 등장하는 theme 값만 자동으로 모아서 보여줍니다.
const themes = computed(() => Array.from(new Set(publications.map((p) => p.theme))))

const activeTheme = ref<string | null>(null)

const filteredPublications = computed(() =>
  activeTheme.value ? publications.filter((p) => p.theme === activeTheme.value) : publications
)
</script>

<style src="./styles/PublicationsPage.css" scoped></style>
