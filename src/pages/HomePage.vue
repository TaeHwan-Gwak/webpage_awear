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

    <!-- <section id="mission" class="mission section">
      <p class="eyebrow">Mission</p>
      <h2>Mission statement</h2>
    </section> -->

    <section id="research" class="themes section">
      <header class="head">
        <p class="eyebrow">Research Themes</p>
        <h2>Section title</h2>
        <router-link class="more-link" to="/research">View Research →</router-link>
      </header>

      <!-- <div class="chip-grid">
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
      </div> -->
    </section>

    <section class="gallery section">
      <header class="head">
        <p class="eyebrow">Glimpses of our Research</p>
      </header>
      <div class="gallery-grid">
        <div v-for="i in 8" :key="i" class="gallery-item" aria-hidden="true">
          <span class="ph-label">Image</span>
        </div>
      </div>
    </section>

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
          <NewsItem v-for="item in displayNews" :key="item.id ?? item.date" :date="item.date" :desc="item.desc"
            :tag="item.tag" />
        </template>
      </ol>

      <router-link class="more-link" to="/news">View all news →</router-link>
    </section>

    <!-- <section id="pi" class="pi section">
      <div class="card">
        <div class="portrait" aria-hidden="true">
          <span class="ph-label">Image</span>
        </div>

        <div class="body">
          <p class="eyebrow">Principal Investigator</p>
          <h2>Name</h2>
          <p class="role">Affiliation / Title</p>
          <p class="bio">Bio</p>
          <span class="mail">Email</span>
          <router-link class="more-link" to="/member">View lab members →</router-link>
        </div>
      </div>
    </section> -->

    <!-- <section id="join" class="join section">
      <div class="panel">
        <p class="eyebrow">How to Apply</p>
        <h2>Join Us</h2>
        <p class="desc">
          Please include a brief self-introduction and background, along with your GPA<br />
          (please note the maximum possible scale), and apply via the email below.
        </p>
        <a class="btn" href="mailto:jkangrobot@gist.ac.kr?subject=[AWEAR Lab Application] OOO Application">
          Apply via email →
        </a>
      </div>
    </section> -->
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

// const themes = [
//   { id: 'topic-1', icon: '🦾', title: 'Theme name', count: 'Paper count' },
//   { id: 'topic-2', icon: '🧠', title: 'Theme name', count: 'Paper count' },
//   { id: 'topic-3', icon: '🤖', title: 'Theme name', count: 'Paper count' },
// ]

const fallbackNews: NewsItemType[] = [
  { id: 'seed-1', date: 'Date', desc: 'News content', tag: 'Tag' },
  { id: 'seed-2', date: 'Date', desc: 'News content', tag: 'Tag' },
  { id: 'seed-3', date: 'Date', desc: 'News content', tag: 'Tag' },
]

const { news, loading: newsLoading, error: newsError } = useNews()
const displayNews = computed(() => (news.value.length ? news.value : fallbackNews))

// TODO: add onMounted to check Admin Auth when entering Home and clear the token
</script>

<style src="./styles/HomePage.css" scoped></style>
