<template>
  <main class="news-page">
    <PageHeader eyebrow="News" title="페이지 제목" description="페이지 설명" />

    <SignalDivider />

    <section class="list section">
      <p v-if="error" class="status">최신 소식을 불러오지 못해 이전 내용을 보여드리고 있어요.</p>

      <ol class="timeline">
        <template v-if="loading">
          <li v-for="n in 6" :key="n" class="skeleton-entry">
            <SkeletonLoader width="70px" height="14px" />
            <SkeletonLoader width="70%" height="15px" />
          </li>
        </template>
        <template v-else>
          <NewsItem
            v-for="item in displayNews"
            :key="item.id ?? item.date"
            :date="item.date"
            :desc="item.desc"
            :tag="item.tag"
          />
        </template>
      </ol>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import NewsItem from '../components/NewsItem.vue'
import { useNews, type NewsItem as NewsItemType } from '../composables/useNews'
import SignalDivider from '../components/SignalDivider.vue'

const fallbackNews: NewsItemType[] = Array.from({ length: 6 }, (_, i) => ({
  id: 'seed-' + i,
  date: '날짜',
  desc: '소식 내용',
  tag: '태그',
}))

const { news, loading, error } = useNews(20)
const displayNews = computed(() => (news.value.length ? news.value : fallbackNews))
</script>

<style src="./styles/NewsPage.css" scoped></style>
