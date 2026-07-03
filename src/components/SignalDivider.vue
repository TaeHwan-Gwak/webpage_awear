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

<style src="./styles/SignalDivider.css" scoped></style>
