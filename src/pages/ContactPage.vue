<template>
  <main class="contact-page">
    <PageHeader eyebrow="Contact" title="페이지 제목" description="페이지 설명" />

    <section class="content section">
      <div class="info">
        <dl>
          <div class="row">
            <dt>Email</dt>
            <dd><a href="mailto:example@gist.ac.kr">이메일</a></dd>
          </div>
          <div class="row">
            <dt>Address</dt>
            <dd>Rm. 217, Dasan Bldg., 123 Cheomdan-gwagiro, Buk-gu, Gwangju</dd>
          </div>
          <div class="row">
            <dt>Tel</dt>
            <dd>전화번호</dd>
          </div>
        </dl>

        <a class="directions" href="https://www.google.com/maps/dir/?api=1&destination=광주광역시+북구+첨단과기로+123+다산빌딩"
          target="_blank" rel="noopener noreferrer">
          Google 지도에서 길찾기 →
        </a>
      </div>

      <GoogleMap address="광주광역시 북구 첨단과기로 123 다산빌딩" />
    </section>

    <SignalDivider />

    <section id="internship" class="fields section">
      <p class="eyebrow">Internship</p>
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
import GoogleMap from '../components/GoogleMap.vue'
</script>

<style src="./styles/ContactPage.css" scoped></style>
