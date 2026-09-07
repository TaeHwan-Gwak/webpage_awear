<template>
  <main class="publications-page">
    <PageHeader eyebrow="Publications" title="Publications" description="" />
    <SignalDivider />

    <div class="content-layout">
      <!-- 1. 모바일 전용: 드롭다운 트리거 버튼 및 모달 메뉴 -->
      <div class="mobile-filter-wrapper">
        <button class="mobile-filter-btn" @click="isMobileMenuOpen = !isMobileMenuOpen">
          <span class="label">Year</span>
          <span class="current">{{ selectedYear === 'all' ? 'All Years' : selectedYear }}</span>
          <span class="arrow" :class="{ open: isMobileMenuOpen }">▾</span>
        </button>

        <!-- 모바일 드롭다운 메뉴 (열렸을 때) -->
        <div v-if="isMobileMenuOpen" class="mobile-dropdown">
          <button class="mobile-opt" :class="{ active: selectedYear === 'all' }" @click="selectYear('all')">
            All Years
          </button>
          <button v-for="y in years" :key="y" class="mobile-opt" :class="{ active: selectedYear === y }"
            @click="selectYear(y)">
            {{ y }}
          </button>
        </div>
      </div>

      <!-- 2. 데스크톱 전용: 왼쪽 세로 네비게이션 사이드바 -->
      <aside class="desktop-sidebar">
        <span class="sidebar-title">FILTER BY YEAR</span>
        <nav class="year-nav">
          <button class="year-link" :class="{ active: selectedYear === 'all' }" @click="selectedYear = 'all'">
            All
          </button>
          <button v-for="y in years" :key="y" class="year-link" :class="{ active: selectedYear === y }"
            @click="selectedYear = y">
            {{ y }}
          </button>
        </nav>
      </aside>

      <!-- 3. 논문 리스트 본문 영역 -->
      <section class="list-section">
        <ul v-if="filteredPublications.length">
          <PublicationItem v-for="(pub, i) in filteredPublications" :key="i" :year="pub.year" :title="pub.title"
            :authors="pub.authors" :venue="pub.venue" :link="pub.link" :images="pub.images" />
        </ul>
        <p v-else class="empty">No papers found for {{ selectedYear }}.</p>
      </section>
    </div>
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
const isMobileMenuOpen = ref(false)

const years = computed(() => Array.from(new Set(publications.map((p) => p.year))))

const filteredPublications = computed(() =>
  selectedYear.value === 'all'
    ? publications
    : publications.filter((p) => p.year === selectedYear.value)
)

const selectYear = (y: string) => {
  selectedYear.value = y
  isMobileMenuOpen.value = false
}
</script>

<style src="./styles/PublicationsPage.css" scoped></style>