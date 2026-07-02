<template>
  <TheNav />
  <main>
    <HeroSection />
    <SignalDivider />
    <MissionSection />
    <ResearchSection />
    <SignalDivider />
    <NewsSection />
    <PISection />
    <JoinSection />
  </main>
  <TheFooter />
</template>

<script setup lang="ts">
import TheNav from './components/TheNav.vue'
import HeroSection from './components/HeroSection.vue'
import SignalDivider from './components/SignalDivider.vue'
import MissionSection from './components/MissionSection.vue'
import ResearchSection from './components/ResearchSection.vue'
import NewsSection from './components/NewsSection.vue'
import PISection from './components/PISection.vue'
import JoinSection from './components/JoinSection.vue'
import TheFooter from './components/TheFooter.vue'
</script>
