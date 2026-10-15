<template>
  <div class="gate">
    <ProtoNavBar class="gate-bar" />

    <div class="split">
      <div class="left">
        <p class="eyebrow">AWEAR Lab · GIST</p>
        <h1>The lab, in motion</h1>
        <p class="sub">
          웨어러블 로봇과 신경 인터페이스로 재활과 보조기술의 다음 단계를 연구합니다.
          로봇이 움직이고, 신호가 기록되고, 사람이 그 안에서 실험을 반복하는 순간들입니다.
        </p>

        <div class="actions">
          <button type="button" class="enter-btn" @click="enter">
            Enter the lab
            <span class="arrow">↓</span>
          </button>
          <button type="button" class="skip-link" @click="enter">Skip intro</button>
        </div>
      </div>

      <div class="right">
        <div class="board">
          <div v-for="cell in cells" :key="cell.key" class="cell" :class="{ dark: cell.isDark }">
            <video
              v-if="cell.isDark"
              :src="videoSrc"
              muted
              loop
              autoplay
              playsinline
              :style="{ filter: cell.filter }"
            ></video>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import ProtoNavBar from '../../components/ProtoNavBar.vue'

const router = useRouter()
const videoSrc = '/proto-media/sample.mp4'

const COLS = 3
const ROWS = 3
const HUES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

const cells = computed(() => {
  const list: { key: string; isDark: boolean; filter: string }[] = []
  let hueIdx = 0
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const isDark = (row + col) % 2 === 0
      list.push({
        key: `${row}-${col}`,
        isDark,
        filter: isDark ? `hue-rotate(${HUES[hueIdx++ % HUES.length]}deg)` : '',
      })
    }
  }
  return list
})

function enter() {
  sessionStorage.setItem('awear-seen-intro', '1')
  router.push('/')
}
</script>

<style scoped>
.gate {
  position: fixed;
  inset: 0;
  z-index: 200;
  overflow-y: auto;
  background: var(--text);
  display: flex;
  flex-direction: column;
}

.gate-bar {
  background: rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.split {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 0;

  @media (max-width: 860px) {
    display: flex;
    flex-direction: column;
  }
}

.left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 64px;

  @media (max-width: 860px) {
    padding: 48px 24px 32px;
  }
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--orange);
  margin: 0 0 16px;
}

h1 {
  font-family: var(--font-display);
  font-size: clamp(32px, 3.4vw + 16px, 56px);
  color: #fff;
  margin: 0 0 20px;
}

.sub {
  color: rgba(255, 255, 255, 0.6);
  max-width: 44ch;
  margin: 0 0 40px;
  font-size: 15px;
  line-height: 1.75;
}

.actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.enter-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  border: none;
  border-radius: 999px;
  background: var(--orange);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  transition: background 0.2s ease, transform 0.2s ease;
}

.enter-btn:hover {
  background: var(--orange-deep);
  transform: translateY(2px);
}

.arrow {
  animation: bob 1.4s ease-in-out infinite;
}

@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
}

.skip-link {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
  text-decoration: underline;
}

.skip-link:hover {
  color: rgba(255, 255, 255, 0.75);
}

.right {
  min-height: 320px;

  @media (max-width: 860px) {
    height: 52vh;
  }
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 3px;
  width: 100%;
  height: 100%;
}

.cell {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.cell.dark {
  background: #000;
  border-color: transparent;
}

.cell video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.cell.dark:hover video {
  transform: scale(1.06);
}
</style>
