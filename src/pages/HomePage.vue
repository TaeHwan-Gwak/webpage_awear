<template>
  <main>
    <section id="top" class="hero">
      <div class="hero-photo">
        <HeroCarousel :images="heroImages" />
      </div>

      <div class="hero-text section">
        <p class="eyebrow">AI-based WEArable Robotics Lab</p>
        <h1>Headline</h1>
        <p class="lede">Intro text</p>
      </div>
    </section>

    <SignalDivider />

    <section id="research" class="themes section">
      <header class="head">
        <p class="eyebrow">Research Themes</p>
        <h2>Section title</h2>
        <router-link class="more-link" to="/research">View Research →</router-link>
      </header>
    </section>

    <SignalDivider />

    <section id="gallery" class="gallery section">
      <header class="head">
        <p class="eyebrow">Gallery</p>
        <h2>Glimpses of our Research</h2>
      </header>

      <div class="gallery-slider">
        <button type="button" class="slide-btn prev" aria-label="Previous" :disabled="galleryIndex === 0"
          @click="galleryPrev">‹</button>

        <div class="gallery-track-wrap">
          <div class="gallery-track" :style="{ transform: `translateX(-${galleryIndex * (100 / galleryVisible)}%)` }">
            <div v-for="i in galleryCount" :key="i" class="gallery-item" aria-hidden="true">
              <span class="ph-label">Image</span>
            </div>
          </div>
        </div>

        <button type="button" class="slide-btn next" aria-label="Next" :disabled="galleryIndex >= galleryMaxIndex"
          @click="galleryNext">›</button>
      </div>
    </section>

    <SignalDivider />

    <section id="ongoing" class="ongoing section">
      <header class="head">
        <p class="eyebrow">On-going Projects</p>
        <h2>Section title</h2>
      </header>

      <div class="project-grid">
        <article v-for="i in 3" :key="i" class="project-card">
          <div class="thumb" aria-hidden="true">
            <span class="ph-label">Image</span>
          </div>
          <p class="project-title">Project title</p>
          <p class="project-desc">Project description</p>
        </article>
      </div>
    </section>

    <SignalDivider />

    <section id="news" class="news section">
      <header class="head">
        <p class="eyebrow">News</p>
        <h2>Section title</h2>
      </header>

      <p v-if="newsError" class="status">Couldn't load the latest news, showing previous content instead.</p>

      <ol class="timeline">
        <template v-if="newsLoading">
          <li v-for="n in 3" :key="n" class="skeleton-entry">
            <SkeletonLoader width="70px" height="14px" />
            <SkeletonLoader width="80%" height="15px" />
          </li>
        </template>
        <template v-else>
          <li v-for="item in displayNews" :key="item.id ?? item.date" class="news-row">
            <NewsItem :date="item.date" :desc="item.desc" :tag="item.tag" />
            <a v-if="item.link" class="read-more" :href="item.link" target="_blank" rel="noopener">Read more →</a>
          </li>
        </template>
      </ol>

      <router-link class="go-to-news" to="/news">Go to News →</router-link>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import SignalDivider from '../components/SignalDivider.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import NewsItem from '../components/NewsItem.vue'
import HeroCarousel from '../components/HeroCarousel.vue'
import { useNews, type NewsItem as NewsItemType } from '../composables/useNews'

const heroImages = [
  'https://picsum.photos/seed/awear-lab-1/1600/900',
  'https://picsum.photos/seed/awear-lab-2/1600/900',
  'https://picsum.photos/seed/awear-lab-3/1600/900',
]

const galleryCount = 5
const galleryVisible = ref(4)
const galleryIndex = ref(0)

const galleryMaxIndex = computed(() => Math.max(0, galleryCount - galleryVisible.value))

function updateGalleryVisible() {
  const w = window.innerWidth
  galleryVisible.value = w <= 560 ? 1 : w <= 860 ? 2 : w <= 1100 ? 3 : 4
  galleryIndex.value = Math.min(galleryIndex.value, galleryMaxIndex.value)
}

if (typeof window !== 'undefined') {
  updateGalleryVisible()
  window.addEventListener('resize', updateGalleryVisible)
}

function galleryPrev() {
  galleryIndex.value = Math.max(0, galleryIndex.value - 1)
}

function galleryNext() {
  galleryIndex.value = Math.min(galleryMaxIndex.value, galleryIndex.value + 1)
}

const fallbackNews: NewsItemType[] = [
  { id: 'seed-1', date: 'Date', desc: 'News content', tag: 'Tag' },
  { id: 'seed-2', date: 'Date', desc: 'News content', tag: 'Tag' },
  { id: 'seed-3', date: 'Date', desc: 'News content', tag: 'Tag' },
]

const { news, loading: newsLoading, error: newsError } = useNews(3)
const displayNews = computed(() => (news.value.length ? news.value.slice(0, 3) : fallbackNews))

// TODO: add onMounted to check Admin Auth when entering Home and clear the token
</script>

<style src="./styles/HomePage.css" scoped></style>
