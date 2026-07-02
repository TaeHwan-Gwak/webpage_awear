<template>
  <section id="research" class="research section">
    <header class="head">
      <p class="eyebrow">Research Focus</p>
      <h2>웨어러블 로봇을 이루는 네 가지 축</h2>
      <p class="sub">
        하드웨어의 생체역학적 설계부터, 신호 기반 제어, AI 소프트웨어, 임상 적용까지 —
        AWEAR Lab의 연구는 사람과 로봇 사이의 상호작용을 중심에 둡니다.
      </p>
    </header>

    <div class="cards">
      <article v-for="area in areas" :key="area.title" class="card">
        <div class="icon" v-html="area.icon" aria-hidden="true" />
        <h3>{{ area.title }}</h3>
        <p>{{ area.desc }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
const areas = [
  {
    title: '케이블 기반 구동 메커니즘',
    desc: '사람의 근육을 모사한 케이블 구동 방식으로, 가볍고 자연스러운 로봇 움직임을 구현합니다.',
    icon: '<svg viewBox="0 0 40 40"><path d="M6 30 Q20 6 34 30" fill="none" stroke-width="2.2"/><circle cx="6" cy="30" r="2.4"/><circle cx="34" cy="30" r="2.4"/></svg>',
  },
  {
    title: '뉴럴 인터페이스 & BCI',
    desc: 'sEMG·뇌신호 기반의 신경 인터페이스로 로봇을 직관적으로 제어하는 기술을 개발합니다.',
    icon: '<svg viewBox="0 0 40 40"><path d="M4 20 L12 20 L15 9 L19 31 L23 15 L26 25 L29 20 L36 20" fill="none" stroke-width="2.2"/></svg>',
  },
  {
    title: 'AI 기반 로봇 제어',
    desc: '인간-로봇 상호작용 데이터를 학습해, 개인 맞춤형으로 반응하는 제어 소프트웨어를 만듭니다.',
    icon: '<svg viewBox="0 0 40 40"><rect x="10" y="10" width="20" height="20" rx="5" fill="none" stroke-width="2.2"/><circle cx="16" cy="18" r="1.6"/><circle cx="24" cy="18" r="1.6"/><path d="M15 25 Q20 29 25 25" fill="none" stroke-width="2"/></svg>',
  },
  {
    title: '재활 · 보조 로보틱스',
    desc: '보행 재활, 상지 재활, 의수, 지능형 휠체어 등 임상 현장에 적용 가능한 로봇을 연구합니다.',
    icon: '<svg viewBox="0 0 40 40"><circle cx="20" cy="9" r="4" fill="none" stroke-width="2.2"/><path d="M20 15 L20 25 M12 20 L28 20 M20 25 L13 35 M20 25 L27 35" fill="none" stroke-width="2.2"/></svg>',
  },
]
</script>

<style scoped>
.head {
  max-width: 620px;
}

.head h2 {
  margin-top: 14px;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
}

.sub {
  margin-top: 18px;
  font-size: 1rem;
}

.cards {
  margin-top: 56px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.card {
  background: var(--surface);
  padding: 32px 26px;
  transition: background 0.2s ease;
}

.card:hover {
  background: var(--surface-2);
}

.icon {
  width: 40px;
  height: 40px;
  color: var(--cyan);
}

.icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.icon :deep(path),
.icon :deep(circle),
.icon :deep(rect) {
  stroke: var(--cyan);
  fill: none;
}

.icon :deep(circle) {
  fill: var(--cyan);
  stroke: none;
}

.card h3 {
  margin-top: 22px;
  font-size: 1.02rem;
  color: var(--text);
  font-weight: 600;
}

.card p {
  margin-top: 12px;
  font-size: 0.88rem;
  line-height: 1.65;
}

@media (max-width: 980px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>
