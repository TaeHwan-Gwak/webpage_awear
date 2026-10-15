<template>
  <main class="proto-page">
    <ProtoNavBar />
    <PageHeader
      eyebrow="Prototype 5"
      title="독립된 Media 페이지"
      description="네비게이션에 'Media' 탭을 하나 추가해서, 뉴스 페이지와 비슷한 레이아웃으로 영상만 모아 보여주는 안입니다. 영상이 계속 늘어날 걸 가정하면 가장 확장성 있는 구조입니다."
    />

    <ul class="section media-list">
      <li v-for="item in items" :key="item.id" class="media-item">
        <div class="frame">
          <video :src="videoSrc" muted loop autoplay playsinline :style="{ filter: item.filter }"></video>
        </div>
        <div class="body">
          <time class="date">{{ item.date }}</time>
          <p class="desc">{{ item.desc }}</p>
        </div>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import ProtoNavBar from '../../components/ProtoNavBar.vue'
import PageHeader from '../../components/PageHeader.vue'

const videoSrc = '/proto-media/sample.mp4'

const items = [
  { id: 'm1', date: '2026.09.28', desc: 'Exosuit 보행 실험 현장 — 10배속 없이 실제 속도로 촬영한 짧은 클립입니다.', filter: 'none' },
  { id: 'm2', date: '2026.08.14', desc: 'BCI 기반 로봇팔 제어 데모 영상, ICROS 2026 발표용으로 촬영.', filter: 'hue-rotate(40deg)' },
  { id: 'm3', date: '2026.07.02', desc: '다자유도 의수 에뮬레이터 파지 테스트.', filter: 'hue-rotate(100deg)' },
  { id: 'm4', date: '2026.05.19', desc: 'SPINDLE 병렬 로봇 재활 훈련 세션 하이라이트.', filter: 'hue-rotate(180deg)' },
]
</script>

<style scoped>
.media-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.media-item {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--border-soft);

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
}

.frame {
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: #000;
}

.frame video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.05em;
  color: var(--text-faint);
}

.desc {
  font-size: 15px;
  line-height: 1.7;
  color: var(--text);
}
</style>
