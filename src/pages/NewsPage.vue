<template>
  <main class="news-page">
    <PageHeader eyebrow="News" title="페이지 제목" description="페이지 설명" />

    <SignalDivider />

    <section class="list section">
      <p v-if="error" class="status">최신 소식을 불러오지 못해 이전 내용을 보여드리고 있어요.</p>

      <div v-if="!loading" class="list-controls">
        <span class="count">전체 {{ displayNews.length }}건</span>
        <label class="page-size">
          페이지당
          <select v-model.number="pageSize">
            <option :value="5">5개</option>
            <option :value="10">10개</option>
            <option :value="20">20개</option>
          </select>
        </label>
      </div>

      <ol class="timeline">
        <template v-if="loading">
          <li v-for="n in 6" :key="n" class="skeleton-entry">
            <SkeletonLoader width="70px" height="14px" />
            <SkeletonLoader width="70%" height="15px" />
          </li>
        </template>
        <template v-else>
          <NewsItem
            v-for="(item, i) in pagedNews"
            :key="item.id ?? item.date"
            :index="displayNews.length - ((currentPage - 1) * pageSize + i)"
            :date="item.date"
            :desc="item.desc"
            :tag="item.tag"
            :link="item.link"
            :image="item.image"
          />
        </template>
      </ol>

      <nav v-if="!loading && totalPages > 1" class="pagination" aria-label="뉴스 페이지 이동">
        <button type="button" class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
          이전
        </button>
        <button
          v-for="p in totalPages"
          :key="p"
          type="button"
          class="page-btn"
          :class="{ active: p === currentPage }"
          @click="currentPage = p"
        >
          {{ p }}
        </button>
        <button
          type="button"
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          다음
        </button>
      </nav>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import NewsItem from '../components/NewsItem.vue'
import { useNews } from '../composables/useNews'
import SignalDivider from '../components/SignalDivider.vue'
import newsData from '../data/news.json'

const { news, loading, error } = useNews(200)
const displayNews = computed(() =>
  news.value.length ? news.value : [...newsData].reverse()
)

const pageSize = ref(10)
const currentPage = ref(1)

const totalPages = computed(() => Math.max(1, Math.ceil(displayNews.value.length / pageSize.value)))

const pagedNews = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return displayNews.value.slice(start, start + pageSize.value)
})

watch([pageSize, displayNews], () => {
  currentPage.value = 1
})
</script>

<style src="./styles/NewsPage.css" scoped></style>
