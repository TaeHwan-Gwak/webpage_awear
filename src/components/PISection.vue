<template>
  <section id="pi" class="pi section">
    <div class="card">
      <div class="portrait" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="59" fill="none" stroke-width="1" />
          <path d="M20 60 L45 60 L52 30 L64 92 L74 45 L82 60 L100 60" fill="none" stroke-width="1.6" />
        </svg>
      </div>

      <div class="body">
        <p class="eyebrow">Principal Investigator</p>
        <h2>강지연 교수 (Jiyeon Kang, Ph.D.)</h2>
        <p class="role">GIST 인공지능융합학과 · 로보틱스 프로그램</p>
        <p class="bio">
          SUNY Buffalo에서 AWEAR Lab을 이끌다 GIST로 연구실을 이전했습니다. 웨어러블 로봇과
          인간-로봇 상호작용을 연구하며, IEEE TNSRE(JCR 상위 2%)의 Associate Editor로도
          활동하고 있습니다.
        </p>
        <a class="mail" href="mailto:jkangrobot@gist.ac.kr">jkangrobot@gist.ac.kr</a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
.card {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 44px;
  align-items: center;
  padding: 48px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: linear-gradient(160deg, var(--surface) 0%, var(--surface-2) 100%);
}

.portrait {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 30% 20%, rgba(140, 123, 255, 0.18), transparent 60%),
    var(--surface-2);
}

.portrait svg {
  width: 100%;
  height: 100%;
}

.portrait circle {
  stroke: var(--border);
}

.portrait path {
  stroke: var(--cyan);
}

h2 {
  margin-top: 10px;
  font-size: 1.5rem;
  color: var(--text);
}

.role {
  margin-top: 6px;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.bio {
  margin-top: 18px;
  max-width: 60ch;
  font-size: 0.96rem;
}

.mail {
  display: inline-block;
  margin-top: 20px;
  font-family: var(--font-mono);
  font-size: 0.88rem;
  color: var(--cyan);
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.mail:hover {
  border-color: var(--cyan);
}

@media (max-width: 640px) {
  .card {
    grid-template-columns: 1fr;
    padding: 32px 24px;
    text-align: center;
  }
  .portrait {
    margin: 0 auto;
  }
}
</style>
