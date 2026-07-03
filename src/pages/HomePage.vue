<template>
  <main>
    <!-- Hero -->
    <section id="top" class="hero">
      <div class="glow glow-a" aria-hidden="true" />
      <div class="glow glow-b" aria-hidden="true" />

      <div class="hero-inner">
        <p class="eyebrow">[]</p>
        <h1>[]</h1>
        <p class="lede">[]</p>

        <div class="actions">
          <a href="#research" class="btn primary">[]</a>
          <a href="#join" class="btn ghost">[]</a>
        </div>
      </div>

      <div class="trace-rail" aria-hidden="true">
        <svg viewBox="0 0 1600 120" preserveAspectRatio="none">
          <path
            class="trace-path"
            d="M0,60 L140,60 L165,20 L190,100 L215,45 L240,60 L520,60 L545,15 L570,105 L595,40 L620,60
               L900,60 L925,25 L950,95 L975,50 L1000,60 L1280,60 L1305,18 L1330,102 L1355,42 L1380,60 L1600,60"
          />
        </svg>
      </div>
    </section>

    <SignalDivider />

    <!-- Mission -->
    <section id="mission" class="mission section">
      <div class="grid">
        <div class="statement">
          <p class="eyebrow">Mission</p>
          <h2>[]</h2>
        </div>

        <dl class="stats">
          <div class="stat" v-for="s in stats" :key="s.label">
            <dt>{{ s.value }}</dt>
            <dd>{{ s.label }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- Research -->
    <section id="research" class="research section">
      <header class="head">
        <p class="eyebrow">Research Focus</p>
        <h2>[]</h2>
        <p class="sub">[]</p>
      </header>

      <div class="cards">
        <article v-for="area in areas" :key="area.title" class="card">
          <div class="icon" v-html="area.icon" aria-hidden="true" />
          <h3>{{ area.title }}</h3>
          <p>{{ area.desc }}</p>
        </article>
      </div>
    </section>

    <SignalDivider />

    <!-- News -->
    <section id="news" class="news section">
      <header class="head">
        <p class="eyebrow">News</p>
        <h2>[]</h2>
      </header>

      <p v-if="newsError" class="status">최신 소식을 불러오지 못해 이전 내용을 보여드리고 있어요.</p>

      <ol class="timeline">
        <template v-if="newsLoading">
          <li v-for="n in 3" :key="n" class="entry">
            <SkeletonLoader width="70px" height="14px" />
            <div class="rail" aria-hidden="true"><span class="dot dot-skeleton" /></div>
            <SkeletonLoader width="80%" height="15px" />
          </li>
        </template>
        <template v-else>
          <li v-for="item in displayNews" :key="item.id ?? item.date" class="entry">
            <time class="date">{{ item.date }}</time>
            <div class="rail" aria-hidden="true"><span class="dot" /></div>
            <p class="desc">{{ item.desc }}</p>
          </li>
        </template>
      </ol>
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
        </div>
      </div>
    </section>

    <!-- Join -->
    <section id="join" class="join section">
      <div class="panel">
        <div class="glow" aria-hidden="true" />
        <div class="content">
          <p class="eyebrow">Join Us</p>
          <h2>[]</h2>
          <p class="desc">[]</p>
          <a class="btn" href="mailto:example@gist.ac.kr">
            []
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8 3l5 5-5 5" fill="none" stroke-width="1.6" /></svg>
          </a>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SignalDivider from '../components/SignalDivider.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import { useNews, type NewsItem } from '../composables/useNews'

// ---- Mission stats ----
const stats = [
  { value: '[]', label: '[]' },
  { value: '[]', label: '[]' },
  { value: '[]', label: '[]' },
]

// ---- Research focus areas ----
const areas = [
  {
    title: '[]',
    desc: '[]',
    icon: '<svg viewBox="0 0 40 40"><path d="M6 30 Q20 6 34 30" fill="none" stroke-width="2.2"/><circle cx="6" cy="30" r="2.4"/><circle cx="34" cy="30" r="2.4"/></svg>',
  },
  {
    title: '[]',
    desc: '[]',
    icon: '<svg viewBox="0 0 40 40"><path d="M4 20 L12 20 L15 9 L19 31 L23 15 L26 25 L29 20 L36 20" fill="none" stroke-width="2.2"/></svg>',
  },
  {
    title: '[]',
    desc: '[]',
    icon: '<svg viewBox="0 0 40 40"><rect x="10" y="10" width="20" height="20" rx="5" fill="none" stroke-width="2.2"/><circle cx="16" cy="18" r="1.6"/><circle cx="24" cy="18" r="1.6"/><path d="M15 25 Q20 29 25 25" fill="none" stroke-width="2"/></svg>',
  },
  {
    title: '[]',
    desc: '[]',
    icon: '<svg viewBox="0 0 40 40"><circle cx="20" cy="9" r="4" fill="none" stroke-width="2.2"/><path d="M20 15 L20 25 M12 20 L28 20 M20 25 L13 35 M20 25 L27 35" fill="none" stroke-width="2.2"/></svg>',
  },
]

// ---- News (Firestore, with skeleton while loading + static fallback) ----
const fallbackNews: NewsItem[] = [
  { id: 'seed-1', date: '[]', desc: '[]' },
  { id: 'seed-2', date: '[]', desc: '[]' },
  { id: 'seed-3', date: '[]', desc: '[]' },
]

const { news, loading: newsLoading, error: newsError } = useNews()
const displayNews = computed(() => (news.value.length ? news.value : fallbackNews))
</script>

<style src="./styles/HomePage.css" scoped></style>
