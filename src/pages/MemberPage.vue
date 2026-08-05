<template>
  <main class="member-page">
    <PageHeader eyebrow="Member" title="[]" description="[]" />

    <SignalDivider />

    <section class="pi-feature section">
      <div class="card">
        <div class="portrait" aria-hidden="true">
          <span class="ph-label">이미지</span>
        </div>
        <div class="body">
          <p class="eyebrow">Principal Investigator</p>
          <h2>[]</h2>
          <p class="role">[]</p>
          <p class="bio">[]</p>
          <a class="mail" href="mailto:example@gist.ac.kr">[]</a>
        </div>
      </div>
    </section>

    <section class="group section">
      <h2 class="group-title">[]</h2>
      <div class="grid">
        <MemberCard v-for="i in 4" :key="'grad-' + i" name="[]" role="[]" />
      </div>
    </section>

    <section class="group section">
      <h2 class="group-title">[]</h2>
      <div class="grid">
        <MemberCard v-for="i in 3" :key="'ug-' + i" name="[]" role="[]" />
      </div>
    </section>

    <section class="group section">
      <h2 class="group-title">[]</h2>
      <div class="grid">
        <MemberCard v-for="i in 3" :key="'alumni-' + i" name="[]" role="[]" note="[]" />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import SignalDivider from '../components/SignalDivider.vue'
import MemberCard from '../components/MemberCard.vue'
</script>

<style src="./styles/MemberPage.css" scoped></style>
