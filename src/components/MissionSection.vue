<template>
  <section id="mission" class="mission section">
    <div class="grid">
      <div class="statement">
        <p class="eyebrow">Mission</p>
        <h2>
          인체공학적 상호작용을 기반으로, 로봇 구동 메커니즘과 뉴럴 인터페이스를 결합하여
          인간의 기능 회복과 증강을 실현합니다.
        </h2>
      </div>

      <dl class="stats">
        <div class="stat" v-for="s in stats" :key="s.label">
          <dt>{{ s.value }}</dt>
          <dd>{{ s.label }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<script setup lang="ts">
const stats = [
  { value: 'SUNY Buffalo → GIST', label: '연구실 이전' },
  { value: 'JCR Top 2%', label: '강지연 교수 · IEEE TNSRE Associate Editor' },
  { value: '재활 · 보조 · 증강', label: '웨어러블 로봇 응용 범위' },
]
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 64px;
  align-items: start;
}

.statement h2 {
  margin-top: 20px;
  font-size: clamp(1.4rem, 2.6vw, 1.9rem);
  font-weight: 500;
  color: var(--text);
  line-height: 1.5;
  max-width: 34ch;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 26px;
  margin: 0;
  padding-left: 32px;
  border-left: 1px solid var(--border);
}

.stat dt {
  font-family: var(--font-mono);
  font-size: 1.05rem;
  color: var(--cyan);
}

.stat dd {
  margin: 6px 0 0;
  font-size: 0.88rem;
  color: var(--text-muted);
}

@media (max-width: 860px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .stats {
    border-left: none;
    padding-left: 0;
    border-top: 1px solid var(--border);
    padding-top: 28px;
  }
}
</style>
