<template>
  <section id="top" class="hero">
    <div class="glow glow-a" aria-hidden="true" />
    <div class="glow glow-b" aria-hidden="true" />

    <div class="hero-inner">
      <p class="eyebrow">GIST · AI-based WEArable Robotics Lab</p>

      <h1>
        사람의 신호로<br />
        로봇의 <span class="gradient-text">근육</span>을 움직이다
      </h1>

      <p class="lede">
        AWEAR Lab은 케이블 기반 구동 메커니즘과 뉴럴 인터페이스를 결합해, 인간의 움직임을
        회복하고 증강하는 웨어러블 로봇 하드웨어와 AI 제어 소프트웨어를 연구합니다.
      </p>

      <div class="actions">
        <a href="#research" class="btn primary">연구 분야 보기</a>
        <a href="#join" class="btn ghost">학부 인턴 지원</a>
      </div>
    </div>

    <div class="trace-rail" aria-hidden="true">
      <svg viewBox="0 0 1600 120" preserveAspectRatio="none">
        <path
          class="trace-path"
          d="M0,60 L140,60 L165,20 L190,100 L215,45 L240,60 L520,60 L545,15 L570,105 L595,40 L620,60
             L900,60 L925,25 L950,95 L975,50 L1000,60 L1280,60 L1305,18 L1330,102 L1355,42 L1380,60 L1600,60"
        />
      </svg>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
.hero {
  position: relative;
  padding: 168px 32px 0;
  max-width: var(--page-max);
  margin: 0 auto;
  overflow: hidden;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.28;
  pointer-events: none;
  z-index: 0;
}

.glow-a {
  width: 480px;
  height: 480px;
  background: var(--cyan);
  top: -160px;
  right: -120px;
}

.glow-b {
  width: 420px;
  height: 420px;
  background: var(--violet);
  top: 60px;
  left: -180px;
  opacity: 0.2;
}

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 760px;
}

.eyebrow {
  margin-bottom: 24px;
}

h1 {
  font-size: clamp(2.4rem, 5.2vw, 3.8rem);
  color: var(--text);
}

.gradient-text {
  background: var(--signal-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.lede {
  margin-top: 28px;
  font-size: 1.08rem;
  max-width: 560px;
}

.actions {
  margin-top: 40px;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.btn {
  padding: 13px 24px;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: transform 0.18s ease, border-color 0.18s ease, opacity 0.18s ease;
}

.btn.primary {
  background: var(--signal-gradient);
  color: #08131a;
  font-weight: 600;
}

.btn.primary:hover {
  transform: translateY(-1px);
}

.btn.ghost {
  border: 1px solid var(--border);
  color: var(--text);
}

.btn.ghost:hover {
  border-color: var(--cyan);
}

.trace-rail {
  position: relative;
  z-index: 1;
  margin-top: 88px;
  width: 100%;
  height: 90px;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
}

.trace-rail svg {
  width: 200%;
  height: 100%;
}

.trace-path {
  fill: none;
  stroke: var(--cyan);
  stroke-width: 1.6;
  stroke-linejoin: round;
  stroke-linecap: round;
  opacity: 0.6;
  animation: drift 14s linear infinite;
}

@keyframes drift {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-800px);
  }
}

@media (max-width: 720px) {
  .hero {
    padding-top: 132px;
  }
  .actions {
    flex-direction: column;
  }
  .btn {
    text-align: center;
  }
}
</style>
