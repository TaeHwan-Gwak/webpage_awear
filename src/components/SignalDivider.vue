<template>
  <div class="signal-divider" role="presentation">
    <svg viewBox="0 0 1200 40" preserveAspectRatio="none">
      <line x1="0" y1="20" x2="1200" y2="20" class="track" />
      <path
        class="trace"
        d="M0,20 L120,20 L140,6 L160,34 L180,20 L360,20 L380,10 L400,30 L420,20 L700,20 L720,4 L740,36 L760,20 L1200,20"
      />
    </svg>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.signal-divider {
  width: 100%;
  line-height: 0;
}

.track {
  stroke: var(--border);
  stroke-width: 1;
}

.trace {
  fill: none;
  stroke: var(--cyan);
  stroke-width: 1.4;
  opacity: 0.55;
}

svg {
  width: 100%;
  height: 24px;
  display: block;
}
</style>
