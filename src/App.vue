<template>
  <TheNav v-if="!isAdminRoute" />
  <router-view />
  <TheFooter v-if="!isAdminRoute" />
  <ScrollToTopButton v-if="!isAdminRoute" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TheNav from './components/TheNav.vue'
import TheFooter from './components/TheFooter.vue'
import ScrollToTopButton from './components/ScrollToTopButton.vue'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>
