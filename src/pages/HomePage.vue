<template>
  <main>
    <section id="top" class="hero">
      <div class="hero-photo">
        <HeroCarousel :images="heroImages" />
      </div>

      <div class="hero-text section">
        <p class="eyebrow">AI-based WEArable Robotics Lab</p>
        <h1>헤드라인</h1>
        <p class="lede">소개 문구</p>
      </div>
    </section>

    <SignalDivider />

    <!-- <section id="mission" class="mission section">
      <p class="eyebrow">Mission</p>
      <h2>미션 문구</h2>
    </section> -->

    <section id="research" class="themes section">
      <header class="head">
        <p class="eyebrow">Research Themes</p>
        <h2>섹션 제목</h2>
        <router-link class="more-link" to="/research">연구 분야 보기 →</router-link>
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
          <span class="ph-label">이미지</span>
        </div>
      </div>
    </section>

    <section id="news" class="news section">
      <header class="head">
        <p class="eyebrow">News</p>
        <h2>섹션 제목</h2>
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
          <NewsItem v-for="item in displayNews" :key="item.id ?? item.date" :date="item.date" :desc="item.desc"
            :tag="item.tag" />
        </template>
      </ol>

      <router-link class="more-link" to="/news">소식 전체 보기 →</router-link>
    </section>

    <!-- <section id="pi" class="pi section">
      <div class="card">
        <div class="portrait" aria-hidden="true">
          <span class="ph-label">이미지</span>
        </div>

        <div class="body">
          <p class="eyebrow">Principal Investigator</p>
          <h2>이름</h2>
          <p class="role">소속·직함</p>
          <p class="bio">소개</p>
          <span class="mail">이메일</span>
          <router-link class="more-link" to="/member">연구실 구성원 보기 →</router-link>
        </div>
      </div>
    </section> -->

    <!-- <section id="join" class="join section">
      <div class="panel">
        <p class="eyebrow">How to Apply</p>
        <h2>Join Us</h2>
        <p class="desc">
          간단한 자기소개 및 경력사항과 함께 학점(만점 기준 표기 필수)을 기재하여<br />
          아래 이메일로 지원 및 문의 바랍니다.
        </p>
        <a class="btn" href="mailto:jkangrobot@gist.ac.kr?subject=[AWEAR Lab 지원] OOO 지원서">
          이메일로 지원하기 →
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
//   { id: 'topic-1', icon: '🦾', title: '테마 이름', count: '논문 수' },
//   { id: 'topic-2', icon: '🧠', title: '테마 이름', count: '논문 수' },
//   { id: 'topic-3', icon: '🤖', title: '테마 이름', count: '논문 수' },
// ]

const fallbackNews: NewsItemType[] = [
  { id: 'seed-1', date: '날짜', desc: '소식 내용', tag: '태그' },
  { id: 'seed-2', date: '날짜', desc: '소식 내용', tag: '태그' },
  { id: 'seed-3', date: '날짜', desc: '소식 내용', tag: '태그' },
]

const { news, loading: newsLoading, error: newsError } = useNews()
const displayNews = computed(() => (news.value.length ? news.value : fallbackNews))

// TODO: OnMounted 달아서 홈 들어올 때 Admin Auth 체크하고, 토큰 날리기
</script>

<style src="./styles/HomePage.css" scoped></style>
