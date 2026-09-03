<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="left">
        <span class="brand">AWEAR Lab</span>
        <span class="divider">·</span>
        <span>Gwangju Institute of Science and Technology</span>
      </div>

      <div class="right">
        <span>jkangrobot@gist.ac.kr</span>
        <span class="divider">·</span>
        <span>123 Cheomdan-gwagiro, Buk-gu, Gwangju, Republic of Korea</span>
      </div>

      <div class="social">
        <a href="#" aria-label="Back to top">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
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
