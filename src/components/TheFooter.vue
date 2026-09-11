<template>
  <footer class="footer">
    <div class="footer-inner">
      <!-- 좌측: 연구실 명칭 & 기관명 -->
      <div class="left">
        <span class="brand">AWEAR Lab</span>
        <span class="divider">·</span>
        <a href="https://www.gist.ac.kr/en/" target="_blank" rel="noreferrer" class="affil-link">
          Gwangju Institute of Science and Technology
        </a>
      </div>

      <!-- 우측: 이메일 & 주소 & Top 버튼 -->
      <div class="right">
        <div class="contact-group">
          <a href="mailto:jkangrobot@gist.ac.kr" class="email">
            jkangrobot@gist.ac.kr
          </a>
          <span class="divider">·</span>
          <span class="address">
            123 Cheomdan-gwagiro, Buk-gu, Gwangju, Republic of Korea
          </span>
        </div>
      </div>
    </div>

    <!-- 하단 저작권 -->
    <div class="legal">
      <p>© {{ year }} AWEAR Lab, GIST. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style src="./styles/TheFooter.css" scoped></style>