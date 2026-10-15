<template>
  <main class="proto-page">
    <ProtoNavBar />
    <PageHeader
      eyebrow="Prototype 3"
      title="Equipment 카드에 데모 영상"
      description="장비가 실제로 동작하는 짧은 영상을 카드에 올려두고, 마우스를 올리면(모바일은 탭하면) 정지 이미지 대신 영상이 재생됩니다. 영상이 아직 없는 장비는 그대로 이미지만 보여줍니다."
    />

    <section class="section grid">
      <article
        v-for="item in items"
        :key="item.id"
        class="card"
        @mouseenter="item.hasVideo && (hoveredId = item.id)"
        @mouseleave="hoveredId = null"
        @click="item.hasVideo && (hoveredId = hoveredId === item.id ? null : item.id)"
      >
        <div class="thumb">
          <video
            v-if="item.hasVideo && hoveredId === item.id"
            :src="videoSrc"
            muted
            loop
            autoplay
            playsinline
          ></video>
          <img v-else :src="item.image" :alt="item.name" loading="lazy" />
          <span v-if="item.hasVideo" class="demo-badge">{{ hoveredId === item.id ? '재생 중' : '▶ Demo' }}</span>
        </div>
        <p class="name">{{ item.name }}</p>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ProtoNavBar from '../../components/ProtoNavBar.vue'
import PageHeader from '../../components/PageHeader.vue'
import equipmentRaw from '../../data/equipment.json'

const videoSrc = '/proto-media/sample.mp4'
const hoveredId = ref<string | null>(null)

const VIDEO_IDS = new Set(['eq6', 'eq2', 'eq7'])

const items = (equipmentRaw as any[]).map((eq) => ({
  id: eq.id as string,
  name: eq.name as string,
  image: (eq.image ?? eq.layers?.[0]?.src) as string,
  hasVideo: VIDEO_IDS.has(eq.id),
}))
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
}

.card {
  cursor: pointer;
}

.thumb {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg);
  border: 1px solid var(--border-soft);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.thumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.demo-badge {
  position: absolute;
  left: 10px;
  top: 10px;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--orange);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 11px;
}

.name {
  margin-top: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
</style>
