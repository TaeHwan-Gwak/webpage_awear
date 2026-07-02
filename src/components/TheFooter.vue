<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="left">
        <span class="brand">AWEAR Lab</span>
        <span class="divider">·</span>
        <span>Gwangju Institute of Science and Technology</span>
      </div>

      <div class="right">
        <a href="mailto:jkangrobot@gist.ac.kr">jkangrobot@gist.ac.kr</a>
        <span class="divider">·</span>
        <span>Rm. 217, Dasan Bldg., 123 Cheomdan-gwagiro, Buk-gu, Gwangju</span>
      </div>
    </div>
    <div class="legal">© {{ year }} AWEAR Lab, GIST. All rights reserved.</div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  border-top: 1px solid var(--border-soft);
  padding: 40px 32px 28px;
}

.footer-inner {
  max-width: var(--page-max);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.brand {
  color: var(--text);
  font-family: var(--font-display);
}

.divider {
  margin: 0 8px;
  color: var(--text-faint);
}

.right a:hover {
  color: var(--cyan);
}

.legal {
  max-width: var(--page-max);
  margin: 24px auto 0;
  font-size: 0.78rem;
  color: var(--text-faint);
  font-family: var(--font-mono);
}

@media (max-width: 640px) {
  .footer-inner {
    flex-direction: column;
  }
}
</style>
