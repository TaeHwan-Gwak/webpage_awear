<template>
  <section id="news" class="news section">
    <header class="head">
      <p class="eyebrow">News</p>
      <h2>연구실 소식</h2>
    </header>

    <p v-if="error" class="status">최신 소식을 불러오지 못해 이전 내용을 보여드리고 있어요.</p>

    <ol class="timeline">
      <li v-for="item in displayNews" :key="item.id ?? item.date" class="entry">
        <time class="date">{{ item.date }}</time>
        <div class="rail" aria-hidden="true"><span class="dot" /></div>
        <p class="desc">{{ item.desc }}</p>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNews, type NewsItem } from '../composables/useNews'

// Firestore의 "news" 컬렉션이 비어 있거나 아직 연결 전이면 이 목록을 보여줍니다.
// 실제 데이터가 들어오면 자동으로 교체됩니다.
const fallbackNews: NewsItem[] = [
  {
    id: 'seed-1',
    date: '2026.04',
    desc: 'AWEAR Lab이 GIST InnoCORE 극한환경 자율 모빌리티 Physical AI 연구단에 참여합니다.',
  },
  {
    id: 'seed-2',
    date: '2026.03',
    desc: 'AI 기반 일상동작 근감소증(sarcopenia) 모니터링 기술 논문이 J. NeuroEng. Rehabil.(JCR 상위 2%)에 게재되었습니다.',
  },
  {
    id: 'seed-3',
    date: '2025 하반기',
    desc: 'BrainJoystick 기반 뇌-기계 인터페이스(BCI) 기술 개발로 한국연구재단 우수 신진 과제를 수주했습니다.',
  },
  {
    id: 'seed-4',
    date: '2025',
    desc: '김기현 학생이 IROS 2025에서 sEMG 기반 의수 제어 연구(MAMBA2 활용)를 발표했습니다.',
  },
  {
    id: 'seed-5',
    date: '2025',
    desc: '강지연 교수가 IEEE TNSRE 저널(JCR 상위 2%)의 Associate Editor로 참여합니다.',
  },
]

const { news, error } = useNews()
const displayNews = computed(() => (news.value.length ? news.value : fallbackNews))
</script>

<style scoped>
.head h2 {
  margin-top: 14px;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
}

.status {
  margin-top: 24px;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-faint);
}

.timeline {
  margin-top: 48px;
  display: flex;
  flex-direction: column;
}

.entry {
  display: grid;
  grid-template-columns: 120px 24px 1fr;
  align-items: start;
  gap: 4px;
  padding: 22px 0;
  border-top: 1px solid var(--border-soft);
}

.entry:last-child {
  border-bottom: 1px solid var(--border-soft);
}

.date {
  font-family: var(--font-mono);
  font-size: 0.86rem;
  color: var(--text-faint);
  padding-top: 2px;
}

.rail {
  display: flex;
  justify-content: center;
  padding-top: 6px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 0 3px rgba(79, 227, 210, 0.14);
}

.desc {
  font-size: 0.96rem;
  color: var(--text);
  max-width: 62ch;
  line-height: 1.7;
}

@media (max-width: 640px) {
  .entry {
    grid-template-columns: 18px 1fr;
    grid-template-rows: auto auto;
  }
  .date {
    grid-column: 1 / -1;
    padding-top: 0;
  }
  .rail {
    padding-top: 4px;
  }
}
</style>
