<template>
  <main class="page-sim">
    <ProtoNavBar />

    <section class="video-hero">
      <div class="hero-copy">
        <p class="eyebrow">AWEAR Lab · GIST</p>
        <h1>The lab, in motion</h1>
        <p class="sub">웨어러블 로봇과 신경 인터페이스로 재활과 보조기술의 다음 단계를 연구합니다.</p>
      </div>

      <div class="hero-grid">
        <div v-for="clip in clips" :key="clip.id" class="tile">
          <video :src="videoSrc" muted loop autoplay playsinline :style="{ filter: clip.filter }"></video>
          <span class="tile-caption">{{ clip.caption }}</span>
        </div>
      </div>

      <button type="button" class="scroll-down-btn" aria-label="Scroll down" @click="scrollToHome">
        <span class="arrow">↓</span>
      </button>
    </section>

    <!-- 아래부터는 실제 Home 페이지(hero 문구 + Recent Media)를 그대로 미리보기로
         이어붙인 것입니다. 실제로 반영되면 이 video-hero가 HomePage.vue의 기존
         .hero(이미지 3장 캐러셀) 자리를 대체합니다. -->
    <div id="home-sim" class="home-sim">
      <section class="hero-text-sim section">
        <p class="eyebrow">{{ home.heroEyebrow }}</p>
        <h2>{{ home.heroTitle }}</h2>
        <p class="lede">{{ home.lede }}</p>
      </section>

      <SignalDivider />

      <section class="media-sim section">
        <header class="head"><p class="eyebrow">Recent Media</p></header>
        <div class="media-grid">
          <div v-for="item in home.recentMedia" :key="item.id" class="media-card">
            <div class="thumb">
              <img v-if="item.image" :src="item.image" alt="" />
              <span v-else class="ph-label">Image</span>
            </div>
            <p class="title">{{ item.title }}</p>
          </div>
        </div>
      </section>

      <p class="continues-note">↓ Gallery · On-going Projects · News로 이어집니다</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import ProtoNavBar from '../../components/ProtoNavBar.vue'
import SignalDivider from '../../components/SignalDivider.vue'
import homeDataRaw from '../../data/home.json'

const home = homeDataRaw
const videoSrc = '/proto-media/sample.mp4'

const clips = [
  { id: 'c1', caption: 'Exosuit walking trial', filter: 'none' },
  { id: 'c2', caption: 'BCI robot-arm control', filter: 'hue-rotate(40deg)' },
  { id: 'c3', caption: 'Prosthetic hand grasp test', filter: 'hue-rotate(90deg)' },
  { id: 'c4', caption: 'Motion capture session', filter: 'hue-rotate(140deg)' },
  { id: 'c5', caption: 'SPINDLE rehab demo', filter: 'hue-rotate(200deg)' },
  { id: 'c6', caption: 'Lab tour, 2026', filter: 'hue-rotate(260deg)' },
]

function scrollToHome() {
  document.getElementById('home-sim')?.scrollIntoView({ behavior: 'smooth' })
}

// 히어로 영역에 있을 때는 아주 살짝만 스크롤/스와이프해도 아래 버튼을 누른 것과
// 똑같이 한 번에 Home 쪽으로 넘어갑니다 - 중간에 애매하게 걸쳐 있는 상태를 없애서
// "넘기는" 느낌을 줍니다. 히어로를 벗어난 다음(Home 미리보기 내부)은 평범하게
// 스크롤되고, 다시 맨 위로 돌아오면 재무장됩니다.
const HERO_ZONE_PX = 40
let snapTriggered = false

function handleWheel(e: WheelEvent) {
  if (snapTriggered || window.scrollY > HERO_ZONE_PX || e.deltaY <= 0) return
  e.preventDefault()
  snapTriggered = true
  scrollToHome()
}

let touchStartY = 0
function handleTouchStart(e: TouchEvent) {
  touchStartY = e.touches[0]?.clientY ?? 0
}

function handleTouchMove(e: TouchEvent) {
  if (snapTriggered || window.scrollY > HERO_ZONE_PX) return
  const currentY = e.touches[0]?.clientY ?? touchStartY
  if (touchStartY - currentY <= 10) return
  e.preventDefault()
  snapTriggered = true
  scrollToHome()
}

function handleScroll() {
  if (window.scrollY <= 4) snapTriggered = false
}

onMounted(() => {
  window.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('touchstart', handleTouchStart, { passive: true })
  window.addEventListener('touchmove', handleTouchMove, { passive: false })
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('wheel', handleWheel)
  window.removeEventListener('touchstart', handleTouchStart)
  window.removeEventListener('touchmove', handleTouchMove)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.video-hero {
  min-height: calc(100dvh - 88px);
  padding: 48px 32px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  text-align: center;
  background: var(--text);
  color: #fff;
}

.hero-copy {
  max-width: 640px;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--orange);
  margin: 0 0 14px;
}

.video-hero h1 {
  font-family: var(--font-display);
  font-size: clamp(30px, 3.6vw + 16px, 52px);
  color: #fff;
  margin: 0 0 12px;
}

.sub {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.hero-grid {
  flex: 1;
  width: 100%;
  max-width: 1100px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 14px;
  min-height: 0;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }
}

.tile {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: #000;
}

.tile video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tile-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8px 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: #fff;
  text-align: left;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.65), transparent);
}

.scroll-down-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 16px;
  flex-shrink: 0;
  transition: background 0.2s ease, transform 0.2s ease;
}

.scroll-down-btn:hover {
  background: var(--orange);
  border-color: var(--orange);
}

.scroll-down-btn .arrow {
  display: inline-block;
  animation: bob 1.4s ease-in-out infinite;
}

@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(3px); }
}

/* ---- 아래는 실제 Home 미리보기(읽기 전용) ---- */

.home-sim .eyebrow {
  color: var(--orange-deep);
}

.hero-text-sim h2 {
  margin-top: 10px;
  font-size: clamp(26px, 2vw + 16px, 36px);
  color: var(--text);
}

.hero-text-sim .lede {
  margin-top: 14px;
  max-width: 68ch;
  font-size: 15px;
  line-height: 1.75;
}

.media-sim .head {
  margin-bottom: 24px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
}

.media-card .thumb {
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--bg);
  border: 1px solid var(--border-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-card .thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.media-card .title {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.continues-note {
  text-align: center;
  padding: 0 32px 64px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-faint);
}
</style>
