<template>
  <main class="research-page">
    <PageHeader eyebrow="Research" title="Page title" description="Page description" />

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
          <span class="ph-label">Image</span>
        </div>
        <div class="heading">
          <p class="index">{{ String(i + 1).padStart(2, '0') }}</p>
          <h2>{{ topic.title }}</h2>
        </div>
        <p class="desc">{{ topic.desc }}</p>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import SignalDivider from '../components/SignalDivider.vue'

const topics = [
  { id: 'topic-1', title: 'BCI / Neural Interface', desc: 'Description' },
  { id: 'topic-2', title: 'Robotics & Prosthetics', desc: 'Description' },
  { id: 'topic-3', title: 'AI & Vision', desc: 'Description' },
]
</script>

<style src="./styles/ResearchPage.css" scoped></style>
