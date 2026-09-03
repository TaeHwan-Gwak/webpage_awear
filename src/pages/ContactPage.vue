<template>
  <main class="contact-page">
    <PageHeader eyebrow="Contact & Join Us" title="Contact" description="AWEAR Lab is always looking for passionate researchers and interns to join us." />

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

        <a class="directions" href="https://www.google.com/maps/dir/?api=1&destination=123+Cheomdan-gwagiro,+Buk-gu,+Gwangju"
          target="_blank" rel="noopener noreferrer">
          Get directions on Google Maps →
        </a>
      </div>

      <img src="/dasanbuilding.webp" alt="Dasan Building" class="dasanbuilding" />
    </section>

    <SignalDivider />

    <div class="join-grid section">
      <section id="internship" class="fields">
        <p class="eyebrow">Research Fields</p>
        <h2>Key Research Fields</h2>
        <ul class="field-list">
          <li v-for="item in ResearchField" :key="item.id">{{ item.field }}</li>
        </ul>
      </section>

      <section class="qualify">
        <p class="eyebrow">Qualifications</p>
        <h2>Preferred Majors</h2>
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
          Please include a brief self-introduction and background, along with your GPA<br />
          (please note the maximum possible scale), and apply or inquire via the email below.
        </p>
        <a class="btn" href="mailto:jkangrobot@gist.ac.kr?subject=[AWEAR Lab Application] OOO Application">
          Apply via email →
        </a>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import SignalDivider from '../components/SignalDivider.vue'

const ResearchField = [
  { id: 'field-1', field: 'Robot design, fabrication, and control' },
  { id: 'field-2', field: 'AI-based neural signal processing' },
  { id: 'field-3', field: 'Vision-based motion recognition and simulation' },
  { id: 'field-4', field: 'Human-friendly wearable robot design' },
  { id: 'field-5', field: 'AI-based robot control software' },
]

const qualifications = [
  { id: 'q-1', text: 'Mechanical Engineering' },
  { id: 'q-2', text: 'Electrical & Computer Engineering' },
  { id: 'q-3', text: 'Robotics Engineering' },
  { id: 'q-4', text: 'Biomedical Engineering' },
  { id: 'q-5', text: 'Rehabilitation Engineering, and related fields' },
]
</script>

<style src="./styles/ContactPage.css" scoped></style>