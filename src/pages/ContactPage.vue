<template>
  <main class="contact-page">
    <PageHeader eyebrow="Contact" title="[]" description="[]" />

    <section class="content section">
      <div class="info">
        <dl>
          <div class="row">
            <dt>Email</dt>
            <dd><a href="mailto:example@gist.ac.kr">[]</a></dd>
          </div>
          <div class="row">
            <dt>Address</dt>
            <dd>[]</dd>
          </div>
          <div class="row">
            <dt>Tel</dt>
            <dd>[]</dd>
          </div>
        </dl>
      </div>

      <div class="map-placeholder" aria-hidden="true">
        <span class="ph-label">지도 영역</span>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
</script>

<style src="./styles/ContactPage.css" scoped></style>
