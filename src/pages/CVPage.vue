<template>
  <main class="cv-page">
    <PageHeader eyebrow="Curriculum Vitae" :title="pi.name" :description="pi.role" />

    <section class="cv-content section">
      <router-link class="back-link" to="/member">← Back to Member</router-link>

      <div v-for="block in pi.cv" :key="block.section" class="cv-block">
        <h2>{{ block.section }}</h2>
        <ul>
          <li v-for="(item, i) in block.items" :key="i">{{ item }}</li>
        </ul>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import membersData from '../data/members.json'

const { pi } = membersData
</script>

<style src="./styles/CVPage.css" scoped></style>
