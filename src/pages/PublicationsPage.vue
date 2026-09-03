<template>
  <main class="publications-page">
    <PageHeader eyebrow="Publications" title="Publications" description="" />

    <SignalDivider />

    <!-- TODO: allow year selection on mobile -->
    <section class="filters section">
      <div class="chip-row">
        <button class="chip" :class="{ active: selectedYear === 'all' }" @click="selectedYear = 'all'">
          All
        </button>
        <button v-for="y in years" :key="y" class="chip" :class="{ active: selectedYear === y }"
          @click="selectedYear = y">
          {{ y }}
        </button>
      </div>
    </section>

    <section class="list section">
      <ul>
        <PublicationItem v-for="(pub, i) in filteredPublications" :key="i" :year="pub.year" :title="pub.title"
          :authors="pub.authors" :venue="pub.venue" :link="pub.link" :images="pub.images" />
      </ul>
      <p v-if="!filteredPublications.length" class="empty">No papers for this year.</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import PublicationItem from '../components/PublicationItem.vue'
import SignalDivider from '../components/SignalDivider.vue'
import publicationsData from '../data/publications.json'

const publications = [...publicationsData].reverse()
const selectedYear = ref('all')

const years = computed(() => Array.from(new Set(publications.map((p) => p.year))))

const filteredPublications = computed(() =>
  selectedYear.value === 'all'
    ? publications
    : publications.filter((p) => p.year === selectedYear.value)
)
</script>

<style src="./styles/PublicationsPage.css" scoped></style>
