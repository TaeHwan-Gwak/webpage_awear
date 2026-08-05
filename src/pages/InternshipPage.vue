<template>
  <main class="internship-page">
    <PageHeader eyebrow="Internship" title="페이지 제목" description="페이지 설명" />

    <SignalDivider />

    <section class="fields section">
      <h2>섹션 제목</h2>
      <ul class="field-list">
        <li v-for="i in 4" :key="i">모집 분야</li>
      </ul>
    </section>

    <section class="qualify section">
      <h2>섹션 제목</h2>
      <ul class="field-list">
        <li v-for="i in 3" :key="i">지원 자격</li>
      </ul>
    </section>

    <section class="apply section">
      <div class="panel">
        <p class="eyebrow">Apply</p>
        <h2>제목</h2>
        <p class="desc">설명</p>
        <a class="btn" href="mailto:example@gist.ac.kr">버튼 문구</a>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import SignalDivider from '../components/SignalDivider.vue'
</script>

<style src="./styles/InternshipPage.css" scoped></style>
