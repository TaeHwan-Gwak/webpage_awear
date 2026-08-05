<template>
  <main class="internship-page">
    <PageHeader eyebrow="Internship" title="[]" description="[]" />

    <SignalDivider />

    <section class="fields section">
      <h2>[]</h2>
      <ul class="field-list">
        <li v-for="i in 4" :key="i">[]</li>
      </ul>
    </section>

    <section class="qualify section">
      <h2>[]</h2>
      <ul class="field-list">
        <li v-for="i in 3" :key="i">[]</li>
      </ul>
    </section>

    <section class="apply section">
      <div class="panel">
        <p class="eyebrow">Apply</p>
        <h2>[]</h2>
        <p class="desc">[]</p>
        <a class="btn" href="mailto:example@gist.ac.kr">[]</a>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import SignalDivider from '../components/SignalDivider.vue'
</script>

<style src="./styles/InternshipPage.css" scoped></style>
