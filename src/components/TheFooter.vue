<template>
  <footer class="footer">
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
    </div>
    <div class="legal">© {{ year }} AWEAR Lab, GIST. All rights reserved.</div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style src="./styles/TheFooter.css" scoped></style>
