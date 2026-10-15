<template>
  <main class="proto-page">
    <ProtoNavBar />
    <PageHeader
      eyebrow="Prototype 4"
      title="Research 토픽에 'Watch demo' 토글"
      description="토픽 설명 옆 이미지 자리에 'Watch demo' 버튼을 추가합니다. 누르면 같은 자리에서 이미지가 영상으로 바뀝니다. 영상이 없는 토픽은 버튼 없이 이미지만 보여줍니다."
    />

    <div class="section topics">
      <article v-for="(topic, i) in topics" :key="topic.id" class="topic">
        <div class="topic-head">
          <span class="topic-num">{{ String(i + 1).padStart(2, '0') }}</span>
          <h2>{{ topic.short }}</h2>
        </div>

        <div class="topic-figure">
          <video v-if="topic.hasVideo && playing.has(topic.id)" :src="videoSrc" muted loop autoplay playsinline></video>
          <img v-else :src="topic.image" alt="" />

          <button
            v-if="topic.hasVideo"
            type="button"
            class="watch-btn"
            @click="toggle(topic.id)"
          >
            {{ playing.has(topic.id) ? '✕ Close demo' : '▶ Watch demo' }}
          </button>
        </div>

        <p class="desc">{{ topic.desc }}</p>
      </article>
    </div>
  </main>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import ProtoNavBar from '../../components/ProtoNavBar.vue'
import PageHeader from '../../components/PageHeader.vue'
import researchRaw from '../../data/research.json'

const videoSrc = '/proto-media/sample.mp4'
const VIDEO_IDS = new Set(['topic-1', 'topic-3', 'topic-6'])

const topics = (researchRaw.topics as any[]).map((t) => ({ ...t, hasVideo: VIDEO_IDS.has(t.id) }))

const playing = reactive(new Set<string>())
function toggle(id: string) {
  if (playing.has(id)) playing.delete(id)
  else playing.add(id)
}
</script>

<style scoped>
.topics {
  display: flex;
  flex-direction: column;
  gap: 56px;
}

.topic-head {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 20px;
}

.topic-num {
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 600;
  color: var(--orange-deep);
}

.topic-head h2 {
  font-size: clamp(20px, 1.2vw + 14px, 26px);
}

.topic-figure {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 20px;
}

.topic-figure img,
.topic-figure video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 21 / 9;
  object-fit: cover;
}

.watch-btn {
  position: absolute;
  left: 16px;
  bottom: 16px;
  padding: 8px 16px;
  border: none;
  border-radius: 999px;
  background: rgba(32, 24, 16, 0.7);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.18s ease;
}

.watch-btn:hover {
  background: var(--orange-deep);
}

.desc {
  font-size: 16px;
  line-height: 1.75;
  max-width: 72ch;
}
</style>
