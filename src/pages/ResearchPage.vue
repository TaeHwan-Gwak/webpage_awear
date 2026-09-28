<template>
  <main class="research-page">
    <PageHeader eyebrow="Research" title="Research" description="" />

    <SignalDivider />

    <div class="research-layout section">
      <aside class="research-nav">
        <span class="nav-label">On this page</span>
        <nav class="topic-nav">
          <a
            v-for="(topic, i) in topics"
            :key="topic.id"
            :href="`#${topic.id}`"
            class="topic-nav-link"
            :class="{ active: activeTopic === topic.id }"
          >
            <span class="num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="label">{{ topic.short }}</span>
          </a>
        </nav>
      </aside>

      <div class="topics">
        <article v-for="(topic, i) in topics" :id="topic.id" :key="topic.id" class="topic" :data-topic="topic.id">
          <div class="topic-head">
            <span class="topic-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <h2>{{ topic.title }}</h2>
          </div>

          <div class="figure-gallery" :class="`count-${Math.min(topic.images, 4)}`">
            <div v-for="n in topic.images" :key="n" class="figure-tile" aria-hidden="true">
              <span class="ph-label">Image</span>
            </div>
          </div>

          <p class="desc">{{ topic.desc }}</p>
        </article>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import SignalDivider from '../components/SignalDivider.vue'

const topics = [
  {
    id: 'topic-1',
    short: 'Vision-based sarcopenia monitoring',
    title: '비전 기반 토크 추정 및 고령 인구 근감소증 모니터링 플랫폼 개발',
    desc: 'We are developing a system for estimating torque through multi-view vision to facilitate ongoing monitoring of the elderly population for potential sarcopenia. A lot of cameras are embedded in our daily living environment (TV, robot vacuum, AC, etc.). Ambient monitoring will be configured using these cameras to monitor the health of the elderly. To calculate joint torque, we employ a biomechanics simulator (OpenSim) combined with AI, aiming to establish a specialized metric for detecting and assessing sarcopenia.',
    images: 3,
  },
  {
    id: 'topic-2',
    short: 'Prosthetic emulator & HITL design',
    title: '다자유도 로봇 의수 에뮬레이터 및 맞춤형 Human-in-the-loop 알고리즘 개발',
    desc: 'This research develops a prosthetic emulator that allows adjustment of design parameters such as DoF and weight. The cable-actuated emulator features a Human-in-the-loop (HITL) framework to optimize prosthetic designs through quantifiable metrics, focusing on both physical and cognitive user responses. This novel emulator will guide the personalized selection of optimal prostheses for amputee users.',
    images: 2,
  },
  {
    id: 'topic-3',
    short: 'AI-based brain–computer interface',
    title: '로봇 제어를 위한 AI 기반 뇌–컴퓨터 인터페이스(BCI)',
    desc: 'We develop brain–computer interfaces (BCIs) that use AI to interpret brain signals and translate user intentions into commands for robotic arms and prosthetic hands. Our research combines neural signal processing, machine learning, and robot control to make assistive devices more intuitive and reliable to operate. Through this work, we aim to help people with limited mobility use robotic assistance in everyday life.',
    images: 3,
  },
  {
    id: 'topic-4',
    short: 'Modular Pilates rehab robot',
    title: '모듈형 필라테스 재활로봇을 활용한 침상 기반 전신 재활 플랫폼 개발',
    desc: 'A modular Pilates robot is developed to support bedridden older adults and individuals with neurological movement disorder conditions. The system provides personalized assist-as-needed support through cable-driven actuators and adaptive control algorithms. It enables upper-limb, trunk, and lower-limb exercises in space-constrained settings such as community hospitals and long-term care facilities.',
    images: 3,
  },
  {
    id: 'topic-5',
    short: 'Neural interface for motor recovery',
    title: '뇌손상 환자를 위한 운동능 회복을 위한 뉴럴 인터페이스 개발',
    desc: 'We aim to develop a platform that applies optimized stimuli based on feedback between the central and peripheral nervous systems. For this, we will create an interface that detects neural signals and induces synchronized stimuli to enhance motor skills of individuals with neurological movement disorders. This neural interface will reactivate and redesign the damaged neural circuits through brain plasticity.',
    images: 2,
  },
  {
    id: 'topic-6',
    short: 'SPINDLE resist-as-needed training',
    title: 'SPINDLE 병렬 로봇을 이용한 환자 맞춤형 Resist-as needed 알고리즘 개발',
    desc: 'Spherical Parallel INstrument for Daily Living Emulation (SPINDLE) trains daily living tasks of individuals with neurological movement disorders. The system offers personalized resistance levels using a resist-as-needed strategy. A new game-based training approach is proposed to tailor to various intensities, enhancing manual dexterity, and muscle strength of patients with neurological movement disorders.',
    images: 4,
  },
]

const activeTopic = ref(topics[0].id)
const intersecting = new Set<string>()
let observer: IntersectionObserver | undefined

function onScroll() {
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
  if (atBottom) activeTopic.value = topics[topics.length - 1].id
}

onMounted(() => {
  const els = document.querySelectorAll<HTMLElement>('[data-topic]')
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.topic
        if (!id) continue
        if (entry.isIntersecting) intersecting.add(id)
        else intersecting.delete(id)
      }
      const firstVisible = topics.find((t) => intersecting.has(t.id))
      if (firstVisible) activeTopic.value = firstVisible.id
    },
    { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
  )
  els.forEach((el) => observer?.observe(el))
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  observer?.disconnect()
  window.removeEventListener('scroll', onScroll)
})
</script>

<style src="./styles/ResearchPage.css" scoped></style>
