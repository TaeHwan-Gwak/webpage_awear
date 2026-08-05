<template>
  <main class="research-page">
    <PageHeader eyebrow="Research" title="[]" description="[]" />

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
  { id: 'topic-1', title: '[]', desc: '[]' },
  { id: 'topic-2', title: '[]', desc: '[]' },
  { id: 'topic-3', title: '[]', desc: '[]' },
  { id: 'topic-4', title: '[]', desc: '[]' },
]
</script>

<style src="./styles/ResearchPage.css" scoped></style>
