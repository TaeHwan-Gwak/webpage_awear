<template>
  <main class="contact-page">
    <PageHeader eyebrow="Contact & Join Us" title="Contact" description="AWEAR Lab과 함께할 열정적인 연구원 및 인턴 학생을 상시 모집합니다." />

    <section class="content section">
      <div class="info">
        <dl>
          <div class="row">
            <dt>Email</dt>
            <dd>jkangrobot@gist.ac.kr</dd>
          </div>
          <div class="row">
            <dt>Address</dt>
            <dd>
              Rm. 217, Dasan building, 123 Cheomdan-gwagiro, Buk-gu, Gwangju, 61005, Republic of Korea
            </dd>
          </div>
          <div class="row">
            <dt>Tel</dt>
            <dd>062-715-5334</dd>
          </div>
        </dl>

        <a class="directions" href="https://www.google.com/maps/dir/?api=1&destination=광주광역시+북구+첨단과기로+123+다산빌딩"
          target="_blank" rel="noopener noreferrer">
          Google 지도에서 길찾기 →
        </a>
      </div>

      <img src="/dasanbuilding.webp" alt="다산빌딩" class="dasanbuilding" />
    </section>

    <SignalDivider />

    <div class="join-grid section">
      <section id="internship" class="fields">
        <p class="eyebrow">Research Fields</p>
        <h2>주요 연구분야</h2>
        <ul class="field-list">
          <li v-for="item in ResearchField" :key="item.id">{{ item.field }}</li>
        </ul>
      </section>

      <section class="qualify">
        <p class="eyebrow">Qualifications</p>
        <h2>모집 대상 전공</h2>
        <ul class="field-list">
          <li v-for="qual in qualifications" :key="qual.id">{{ qual.text }}</li>
        </ul>
      </section>
    </div>

    <section class="apply section">
      <div class="panel">
        <p class="eyebrow">How to Apply</p>
        <h2>Join Us</h2>
        <p class="desc">
          간단한 자기소개 및 경력사항과 함께 학점(만점 기준 표기 필수)을 기재하여<br />
          아래 이메일로 지원 및 문의 바랍니다.
        </p>
        <a class="btn" href="mailto:jkangrobot@gist.ac.kr?subject=[AWEAR Lab 지원] OOO 지원서">
          이메일로 지원하기 →
        </a>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import SignalDivider from '../components/SignalDivider.vue'

const ResearchField = [
  { id: 'field-1', field: '로봇 설계, 제작 및 제어' },
  { id: 'field-2', field: '인공지능 기반 뇌신호 처리' },
  { id: 'field-3', field: '비전 기반 모션인식 및 시뮬레이터' },
  { id: 'field-4', field: '인체 친화적 웨어러블 로봇 디자인' },
  { id: 'field-5', field: '인공지능 응용 로봇 제어 소프트웨어' },
]

const qualifications = [
  { id: 'q-1', text: '기계공학' },
  { id: 'q-2', text: '전기전자 컴퓨터 공학' },
  { id: 'q-3', text: '로봇공학' },
  { id: 'q-4', text: '의공학' },
  { id: 'q-5', text: '재활공학 등 관련 전공' },
]
</script>

<style src="./styles/ContactPage.css" scoped></style>