<template>
  <article class="member-card">
    <div class="avatar" aria-hidden="true">
      <span class="ph-label">Image</span>
    </div>
    <h3>{{ name }}</h3>
    <p class="role">{{ role }}</p>
    <p class="note">{{ note }}</p>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  role: string
  note?: string
}>()
</script>

<style src="./styles/MemberCard.css" scoped></style>
