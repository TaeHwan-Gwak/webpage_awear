<template>
  <footer class="footer">
    <div class="sponsors section">
      <p class="eyebrow">Sponsors &amp; Affiliates</p>
      <div class="logos">
        <div v-for="i in 5" :key="i" class="logo-placeholder" aria-hidden="true">
          <span class="ph-label">로고</span>
        </div>
      </div>
    </div>

    <div class="footer-inner">
      <div class="left">
        <span class="brand">AWEAR Lab</span>
        <span class="divider">·</span>
        <span>Gwangju Institute of Science and Technology</span>
      </div>

      <div class="right">
        <a href="mailto:example@gist.ac.kr">[]</a>
        <span class="divider">·</span>
        <span>[]</span>
      </div>

      <div class="social">
        <a href="#" aria-label="YouTube">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12s0-3.4-.4-5a3 3 0 0 0-2.1-2.1C17.9 4.5 12 4.5 12 4.5s-5.9 0-7.5.4A3 3 0 0 0 2.4 7C2 8.6 2 12 2 12s0 3.4.4 5a3 3 0 0 0 2.1 2.1c1.6.4 7.5.4 7.5.4s5.9 0 7.5-.4A3 3 0 0 0 21.6 17c.4-1.6.4-5 .4-5Z" fill="none" stroke-width="1.5"/><path d="M10 9.5v5l4.5-2.5Z" fill="currentColor" stroke="none"/></svg>
        </a>
        <a href="#" aria-label="X (Twitter)">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4l16 16M20 4 4 20" stroke-width="1.6"/></svg>
        </a>
      </div>
    </div>
    <div class="legal">© {{ year }} AWEAR Lab, GIST. All rights reserved.</div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style src="./styles/TheFooter.css" scoped></style>
