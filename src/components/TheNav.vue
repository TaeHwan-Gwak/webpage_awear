<template>
  <header class="nav" :class="{ scrolled }">
    <div class="nav-inner">
      <a href="#top" class="brand">
        <svg class="mark" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M4 24 L11 8 L16 20 L21 8 L28 24" />
        </svg>
        <span class="brand-text">
          <strong>AWEAR</strong>
          <em>Lab</em>
        </span>
      </a>

      <nav class="links" aria-label="주요 섹션">
        <a v-for="item in items" :key="item.href" :href="item.href">{{ item.label }}</a>
      </nav>

      <a class="cta" href="#join">인턴 지원</a>

      <button class="burger" :aria-expanded="open" aria-label="메뉴 열기" @click="open = !open">
        <span /><span /><span />
      </button>
    </div>

    <transition name="drop">
      <nav v-if="open" class="mobile-links" aria-label="주요 섹션 (모바일)">
        <a v-for="item in items" :key="item.href" :href="item.href" @click="open = false">{{ item.label }}</a>
        <a class="cta" href="#join" @click="open = false">인턴 지원</a>
      </nav>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const open = ref(false)
const scrolled = ref(false)

const items = [
  { label: '연구실 소개', href: '#mission' },
  { label: '연구 분야', href: '#research' },
  { label: '소식', href: '#news' },
  { label: '지도교수', href: '#pi' },
  { label: '연락처', href: '#join' },
]

function onScroll() {
  scrolled.value = window.scrollY > 12
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.nav {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 50;
  border-bottom: 1px solid transparent;
  transition: border-color 0.25s ease, background 0.25s ease;
}

.nav.scrolled {
  background: rgba(10, 14, 20, 0.82);
  backdrop-filter: blur(10px);
  border-bottom-color: var(--border);
}

.nav-inner {
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 18px 32px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: auto;
}

.mark {
  width: 24px;
  height: 24px;
}

.mark path {
  fill: none;
  stroke: var(--cyan);
  stroke-width: 2.4;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.brand-text {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--text);
}

.brand-text em {
  font-style: normal;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.links {
  display: flex;
  gap: 28px;
}

.links a {
  font-size: 0.92rem;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.links a:hover {
  color: var(--text);
}

.cta {
  border: 1px solid var(--border);
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 0.88rem;
  color: var(--text);
  white-space: nowrap;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.cta:hover {
  border-color: var(--cyan);
  background: rgba(79, 227, 210, 0.08);
}

.burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  padding: 6px;
}

.burger span {
  width: 20px;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
}

.mobile-links {
  display: none;
}

@media (max-width: 860px) {
  .links {
    display: none;
  }
  .cta {
    display: none;
  }
  .burger {
    display: flex;
  }
  .mobile-links {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 20px 20px;
    background: rgba(10, 14, 20, 0.96);
    border-bottom: 1px solid var(--border);
  }
  .mobile-links a {
    padding: 12px 4px;
    border-bottom: 1px solid var(--border-soft);
    color: var(--text-muted);
  }
  .mobile-links .cta {
    display: block;
    text-align: center;
    margin-top: 12px;
    color: var(--cyan);
  }
}

.drop-enter-active,
.drop-leave-active {
  transition: opacity 0.18s ease;
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
}
</style>
