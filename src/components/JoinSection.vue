<template>
  <section id="join" class="join section">
    <div class="panel">
      <div class="glow" aria-hidden="true" />
      <div class="content">
        <p class="eyebrow">Join Us</p>
        <h2>학부 인턴을 상시 모집합니다</h2>
        <p class="desc">
          로봇 설계·제작·제어, AI 기반 뇌신호 처리, 비전 기반 모션 인식, 인체 친화적 웨어러블
          로봇 디자인 분야에 관심 있는 기계공학, 전기전자컴퓨터공학, 로봇공학, 의공학, 재활공학
          전공 학생을 기다립니다.
        </p>
        <a class="btn" href="mailto:jkangrobot@gist.ac.kr">
          이메일로 지원하기
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8 3l5 5-5 5" fill="none" stroke-width="1.6" /></svg>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
.panel {
  position: relative;
  border-radius: 20px;
  border: 1px solid var(--border);
  padding: 72px 56px;
  overflow: hidden;
  background: var(--surface);
}

.glow {
  position: absolute;
  inset: -40% -10% auto auto;
  width: 460px;
  height: 460px;
  background: var(--signal-gradient);
  opacity: 0.14;
  filter: blur(100px);
  border-radius: 50%;
}

.content {
  position: relative;
  max-width: 560px;
}

h2 {
  margin-top: 14px;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  color: var(--text);
}

.desc {
  margin-top: 18px;
  font-size: 0.98rem;
}

.btn {
  margin-top: 32px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 26px;
  border-radius: 999px;
  background: var(--signal-gradient);
  color: #08131a;
  font-weight: 600;
  font-size: 0.95rem;
  transition: transform 0.18s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn svg {
  width: 15px;
  height: 15px;
  stroke: #08131a;
}

@media (max-width: 640px) {
  .panel {
    padding: 44px 24px;
  }
}
</style>
