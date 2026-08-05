<template>
  <main class="member-page">
    <PageHeader eyebrow="Member" title="페이지 제목" description="페이지 설명" />

    <SignalDivider />

    <section class="pi-feature section">
      <div class="card">
        <div class="portrait" aria-hidden="true">
          <span class="ph-label">이미지</span>
        </div>
        <div class="body">
          <p class="eyebrow">Principal Investigator</p>
          <h2>이름</h2>
          <p class="role">소속·직함</p>
          <p class="bio">소개</p>
          <a class="mail" href="mailto:example@gist.ac.kr">이메일</a>
        </div>
      </div>
    </section>

    <section class="group section">
      <h2 class="group-title">그룹명</h2>
      <div class="grid">
        <MemberCard v-for="i in 4" :key="'grad-' + i" name="이름" role="역할" />
      </div>
    </section>

    <section class="group section">
      <h2 class="group-title">그룹명</h2>
      <div class="grid">
        <MemberCard v-for="i in 3" :key="'ug-' + i" name="이름" role="역할" />
      </div>
    </section>

    <section class="group section">
      <h2 class="group-title">그룹명</h2>
      <div class="grid">
        <MemberCard v-for="i in 3" :key="'alumni-' + i" name="이름" role="역할" note="비고" />
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
