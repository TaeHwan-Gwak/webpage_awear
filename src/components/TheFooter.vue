<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="left">
        <span class="brand">AWEAR Lab</span>
        <span class="divider">·</span>
        <span>Gwangju Institute of Science and Technology</span>
      </div>

      <div class="right">
        <a href="mailto:example@gist.ac.kr">이메일</a>
        <span class="divider">·</span>
        <span>주소</span>
      </div>

      <div class="social">
        <a href="#" aria-label="맨 위로 이동">
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
