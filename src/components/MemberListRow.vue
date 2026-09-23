<template>
  <article class="member-list-row">
    <div class="list-photo" aria-hidden="true">
      <img v-if="photo" :src="photo" :alt="name" class="list-photo-img" />
      <span v-else class="ph-label">Image</span>
    </div>
    <div class="list-info">
      <h3>{{ name }}</h3>
      <p class="role">{{ role }}</p>
      <p v-if="note" class="note">{{ note }}</p>
      <p v-if="email" class="email">{{ email }}</p>
      <p v-if="interests" class="interests">{{ interests }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  role: string
  note?: string
  email?: string
  interests?: string
  photo?: string
}>()
</script>

<style src="./styles/MemberListRow.css" scoped></style>
