<template>
  <TheNav />
  <router-view />
  <TheFooter />
</template>

<script setup lang="ts">
import TheNav from './components/TheNav.vue'
import TheFooter from './components/TheFooter.vue'
</script>
