<template>
  <main>
    <!-- Hero: photo-first, like Stanford Biomechatronics -->
    <section id="top" class="hero">
      <div class="hero-photo" aria-hidden="true">
        <span class="ph-label">이미지</span>
      </div>
      <div class="hero-caption">
        <p class="location">[]</p>
      </div>

      <div class="hero-text section">
        <p class="eyebrow">GIST · AI-based WEArable Robotics Lab</p>
        <h1>[]</h1>
        <p class="lede">[]</p>
        <router-link class="more-link" to="/research">연구 분야 보기 →</router-link>
      </div>
    </section>

    <SignalDivider />

    <!-- Mission -->
    <section id="mission" class="mission section">
      <p class="eyebrow">Mission</p>
      <h2>[]</h2>
    </section>

    <!-- Research Themes: KIXLAB-style tag chips -->
    <section id="research" class="themes section">
      <header class="head">
        <p class="eyebrow">Research Themes</p>
        <h2>[]</h2>
      </header>

      <div class="chip-grid">
        <router-link
          v-for="theme in themes"
          :key="theme.id"
          :to="`/research#${theme.id}`"
          class="chip"
        >
          <span class="chip-icon" aria-hidden="true">{{ theme.icon }}</span>
          <span class="chip-title">{{ theme.title }}</span>
          <span class="chip-count">{{ theme.count }}</span>
        </router-link>
      </div>
    </section>

    <!-- Glimpses of our Research: Stanford-style photo gallery -->
    <section class="gallery section">
      <header class="head">
        <p class="eyebrow">Glimpses of our Research</p>
      </header>
      <div class="gallery-grid">
        <div v-for="i in 8" :key="i" class="gallery-item" aria-hidden="true">
          <span class="ph-label">이미지</span>
        </div>
      </div>
    </section>

    <SignalDivider />

    <!-- Media: KIXLAB-style video showcase -->
    <section class="media section">
      <header class="head">
        <p class="eyebrow">Media</p>
        <h2>[]</h2>
      </header>
      <div class="media-grid">
        <a v-for="i in 3" :key="i" href="#" class="media-item">
          <div class="thumb" aria-hidden="true">
            <span class="play" aria-hidden="true">▶</span>
          </div>
          <p class="media-title">[]</p>
          <p class="media-date">[]</p>
        </a>
      </div>
    </section>

    <!-- News -->
    <section id="news" class="news section">
      <header class="head">
        <p class="eyebrow">News</p>
        <h2>[]</h2>
      </header>

      <p v-if="newsError" class="status">최신 소식을 불러오지 못해 이전 내용을 보여드리고 있어요.</p>

      <ol class="timeline">
        <template v-if="newsLoading">
          <li v-for="n in 3" :key="n" class="skeleton-entry">
            <SkeletonLoader width="70px" height="14px" />
            <SkeletonLoader width="80%" height="15px" />
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

      <router-link class="more-link" to="/news">소식 전체 보기 →</router-link>
    </section>

    <!-- Principal Investigator -->
    <section id="pi" class="pi section">
      <div class="card">
        <div class="portrait" aria-hidden="true">
          <span class="ph-label">이미지</span>
        </div>

        <div class="body">
          <p class="eyebrow">Principal Investigator</p>
          <h2>[]</h2>
          <p class="role">[]</p>
          <p class="bio">[]</p>
          <a class="mail" href="mailto:example@gist.ac.kr">[]</a>
          <router-link class="more-link" to="/member">연구실 구성원 보기 →</router-link>
        </div>
      </div>
    </section>

    <!-- Join -->
    <section id="join" class="join section">
      <div class="panel">
        <p class="eyebrow">Join Us</p>
        <h2>[]</h2>
        <p class="desc">[]</p>
        <a class="btn" href="mailto:example@gist.ac.kr">[]</a>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SignalDivider from '../components/SignalDivider.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import NewsItem from '../components/NewsItem.vue'
import { useNews, type NewsItem as NewsItemType } from '../composables/useNews'

// ---- Research themes (KIXLAB-style tag chips, link to /research#id) ----
const themes = [
  { id: 'topic-1', icon: '🦾', title: '[]', count: '[]' },
  { id: 'topic-2', icon: '🧠', title: '[]', count: '[]' },
  { id: 'topic-3', icon: '🤖', title: '[]', count: '[]' },
  { id: 'topic-4', icon: '🏃', title: '[]', count: '[]' },
]

// ---- News (Firestore, with skeleton while loading + static fallback) ----
const fallbackNews: NewsItemType[] = [
  { id: 'seed-1', date: '[]', desc: '[]', tag: '[]' },
  { id: 'seed-2', date: '[]', desc: '[]', tag: '[]' },
  { id: 'seed-3', date: '[]', desc: '[]', tag: '[]' },
]

const { news, loading: newsLoading, error: newsError } = useNews()
const displayNews = computed(() => (news.value.length ? news.value : fallbackNews))
</script>

<style src="./styles/HomePage.css" scoped></style>
