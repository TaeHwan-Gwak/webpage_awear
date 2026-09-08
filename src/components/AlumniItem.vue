<template>
  <li class="alumni-item">
    <span class="name">{{ name }}</span>
    <span class="role">{{ role }}</span>
    <span v-if="note" class="note">{{ note }}</span>
  </li>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  role: string
  note?: string
}>()
</script>

<style src="./styles/AlumniItem.css" scoped></style>
