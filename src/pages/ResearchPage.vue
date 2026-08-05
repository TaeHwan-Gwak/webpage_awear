<template>
  <main class="research-page">
    <PageHeader eyebrow="Research" title="페이지 제목" description="페이지 설명" />

    <SignalDivider />

    <section class="topics section">
      <article
        v-for="(topic, i) in topics"
        :id="topic.id"
        :key="topic.id"
        class="topic"
        :class="{ reverse: i % 2 === 1 }"
      >
        <div class="figure" aria-hidden="true">
          <span class="ph-label">이미지</span>
        </div>
        <div class="body">
          <p class="index">{{ String(i + 1).padStart(2, '0') }}</p>
          <h2>{{ topic.title }}</h2>
          <p class="desc">{{ topic.desc }}</p>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import SignalDivider from '../components/SignalDivider.vue'

const topics = [
  { id: 'topic-1', title: '연구 주제명', desc: '설명' },
  { id: 'topic-2', title: '연구 주제명', desc: '설명' },
  { id: 'topic-3', title: '연구 주제명', desc: '설명' },
  { id: 'topic-4', title: '연구 주제명', desc: '설명' },
]
</script>

<style src="./styles/ResearchPage.css" scoped></style>
