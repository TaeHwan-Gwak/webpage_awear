<template>
  <main>
    <section id="top" class="hero">
      <div class="hero-photo">
        <HeroCarousel :images="heroImages" />
      </div>

      <div class="hero-text section">
        <p class="eyebrow">AI-based WEArable Robotics Lab</p>
        <h1>AWEAR Lab</h1>
        <p class="lede">AWEAR Lab은 GIST AI학과 로봇트랙 소속으로, 기계공학, 전기전자공학, 컴퓨터공학, 의공학 등에서 익힌 전공 지식에 AI를 접목해 사람의 움직임을 돕는 로봇과 헬스케어 기술을 연구합니다. 이를 위해 로봇 의수·재활로봇을 설계하고, 근육·뇌 신호로 로봇의 움직임을 제어하는 Physical AI를 연구하고 있습니다. 또한 뇌–컴퓨터 인터페이스를 통해 사람과 로봇을 연결하는 기술과, 일상 동작 영상으로 근력과 신체 기능의 변화를 분석하는 헬스케어 AI를 개발하고 있습니다.</p>
        <p class="lede lede-en">Welcome to the AI-based WEArable Robotics (AWEAR) Laboratory at Gwangju Institute of Science and Technology (GIST). Our research combines the design and control of robotic prostheses and rehabilitation robots with AI that interprets muscle and brain signals. We also develop brain–computer interfaces (BCIs) that connect people with robots, and healthcare AI that uses videos of everyday movements to assess muscle strength and changes in physical function.</p>
      </div>
    </section>

    <SignalDivider />

    <section id="media" class="media section">
      <header class="head">
        <p class="eyebrow">Recent Media</p>
      </header>

      <div class="media-grid">
        <a v-for="item in recentMedia" :key="item.title" class="media-item" :href="item.link" target="_blank"
          rel="noopener">
          <div class="thumb" aria-hidden="true">
            <span class="ph-label">Image</span>
          </div>
          <p class="media-title">{{ item.title }}</p>
        </a>
      </div>
    </section>

    <SignalDivider />

    <section id="research" class="themes section">
      <header class="head">
        <p class="eyebrow">Research Themes</p>
        <h2>6 research directions — from robotic prosthetics and rehabilitation robots to brain–computer interfaces</h2>
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
      </header>

      <div class="project-grid">
        <article v-for="item in ongoingProjects" :key="item.title" class="project-card">
          <div class="thumb" aria-hidden="true">
            <span class="ph-label">Image</span>
          </div>
          <p class="project-title">{{ item.title }}</p>
        </article>
      </div>
    </section>

    <SignalDivider />

    <section id="news" class="news section">
      <header class="head">
        <p class="eyebrow">News</p>
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
            <NewsItem :date="item.date" :desc="item.desc" :tag="item.tag">
              <a v-if="item.link" class="read-more" :href="item.link" target="_blank" rel="noopener">Read more →</a>
            </NewsItem>
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
import newsDataRaw from '../data/news.json'

const heroImages = [
  'https://picsum.photos/seed/awear-lab-1/1600/900',
  'https://picsum.photos/seed/awear-lab-2/1600/900',
  'https://picsum.photos/seed/awear-lab-3/1600/900',
]

const recentMedia = [
  {
    title: 'Physics-informed AI를 통한 노인의 근감소증 추적 기술 JCR 상위 2% JNER에 게재',
    link: 'https://n.news.naver.com/article/030/0003435675?sid=102',
  },
  {
    title: '뇌성마비환자 보행 개선 로봇 재활기술 개발, JCR 상위 2% 이내 IEEE TNSRE 게재',
    link: 'https://www.irobotnews.com/news/articleView.html?idxno=45239',
  },
  {
    title: "로봇, '맞춤형 의수 설계' 맡는다…손목 동작 정밀 구현 Robotics Automation Letter 게재",
    link: 'https://v.daum.net/v/Q8SX1H6bWK?f=p',
  },
]

const ongoingProjects = [
  { title: 'AI 최고급 신진연구자 지원사업 (AI 스타펠로우십) — MIND 의료 파운데이션 모델 개발' },
  { title: '침상환자 재활을 위한 필라테스봇, 국립재활원' },
  { title: 'BrainJoystick: 로봇 제어 BCI, 우수신진과제, 연구재단' },
  { title: '파킨슨병환자를 위한 로봇-뉴럴인터페이스, 연구재단 뇌선도' },
  { title: 'GIST InnoCore 극한환경 피지컬AI - Polar AI' },
  { title: 'GIST InnoCore 알츠하이머뇌 리포그래밍 REMAP' },
  { title: '일상재활 자립을 위한 보조기기 개발, 보건복지부' },
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

// 로컬 news.json 최신순(날짜 desc) 상위 3개 — 관리자 편집은 News 페이지의 news.json에 반영되므로
// 홈에서도 같은 파일을 읽어 최신 소식이 자동으로 보이게 합니다.
const localLatestNews = [...(newsDataRaw as NewsItemType[])]
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  .slice(0, 3)

const { news, loading: newsLoading, error: newsError } = useNews(3)
const displayNews = computed(() => {
  if (news.value.length) return news.value.slice(0, 3)
  if (localLatestNews.length) return localLatestNews
  return fallbackNews
})

// TODO: add onMounted to check Admin Auth when entering Home and clear the token
</script>

<style src="./styles/HomePage.css" scoped></style>
