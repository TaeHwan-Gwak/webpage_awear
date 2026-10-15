<template>
  <main class="proto-page">
    <ProtoNavBar />
    <PageHeader
      eyebrow="Prototype 2"
      title="Home 페이지에 영상 섹션 추가"
      description="Hero와 Recent Media 사이(또는 On-going Projects 다음)에 'Lab in Motion' 섹션을 새로 넣는 안입니다. 아래는 실제 Home의 흐름 중 해당 위치만 잘라서 보여주는 목업입니다."
    />

    <div class="section mock-block hero-mock">
      <span class="mock-tag">기존 — Hero carousel</span>
    </div>

    <section class="section video-section">
      <div class="video-head">
        <p class="eyebrow">Lab in Motion</p>
        <h2>연구 현장을 짧은 영상으로</h2>
      </div>

      <div class="video-track">
        <article v-for="clip in clips" :key="clip.id" class="video-card">
          <div class="video-frame">
            <video :src="videoSrc" muted loop autoplay playsinline :style="{ filter: clip.filter }"></video>
            <span class="play-badge">▶ {{ clip.duration }}</span>
          </div>
          <p class="video-title">{{ clip.title }}</p>
          <p class="video-date">{{ clip.date }}</p>
        </article>
      </div>
    </section>

    <div class="section mock-block ongoing-mock">
      <span class="mock-tag">기존 — On-going Projects</span>
    </div>
  </main>
</template>

<script setup lang="ts">
import ProtoNavBar from '../../components/ProtoNavBar.vue'
import PageHeader from '../../components/PageHeader.vue'

const videoSrc = '/proto-media/sample.mp4'

const clips = [
  { id: 'c1', title: 'Exosuit 보행 실험', date: '2026.09', duration: '0:18', filter: 'none' },
  { id: 'c2', title: 'BCI 로봇팔 제어 데모', date: '2026.08', duration: '0:24', filter: 'hue-rotate(40deg)' },
  { id: 'c3', title: '의수 파지 테스트', date: '2026.07', duration: '0:15', filter: 'hue-rotate(90deg)' },
  { id: 'c4', title: 'SPINDLE 재활 훈련', date: '2026.06', duration: '0:21', filter: 'hue-rotate(150deg)' },
]
</script>

<style scoped>
.mock-block {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 140px;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  padding: 0;
}

.mock-tag {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.05em;
  color: var(--text-faint);
}

.video-section {
  padding-top: 0;
}

.video-head {
  margin-bottom: 28px;
}

.video-head .eyebrow {
  display: block;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--orange-deep);
  margin-bottom: 8px;
}

.video-head h2 {
  font-size: clamp(22px, 1.6vw + 16px, 30px);
}

.video-track {
  display: flex;
  gap: 18px;
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-snap-type: x proximity;
}

.video-card {
  flex: 0 0 auto;
  width: 260px;
  scroll-snap-align: start;
}

.video-frame {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: #000;
  box-shadow: var(--shadow-sm);
}

.video-frame video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-badge {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 11px;
}

.video-title {
  margin-top: 12px;
  font-size: 14px;
  color: var(--text);
  font-weight: 600;
}

.video-date {
  margin-top: 2px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-faint);
}
</style>
