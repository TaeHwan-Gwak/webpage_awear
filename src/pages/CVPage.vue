<template>
  <main class="cv-page">
    <header class="cv-header section">
      <router-link class="back-link" to="/member">← Back to Member</router-link>
      <p class="eyebrow">Curriculum Vitae</p>

      <div class="cv-header-row">
        <div class="cv-header-text">
          <h1>
            {{ pi.name }}
            <span v-if="pi.nameKr" class="name-kr">({{ pi.nameKr }})</span>
          </h1>
          <p class="role">{{ pi.role }}</p>
          <p class="dept">{{ pi.department }}</p>
          <p class="inst">{{ pi.institution }}</p>
          <a class="mail" :href="`mailto:${pi.email}`">{{ pi.email }}</a>
        </div>

        <div class="cv-photo">
          <img v-if="pi.photo" :src="pi.photo" :alt="pi.name"
            :style="{ objectPosition: `center ${pi.photoPosition ?? 50}%` }" />
          <span v-else class="ph-label">Image</span>
        </div>
      </div>
    </header>

    <section class="cv-content section">
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
import membersData from '../data/members.json'

const { pi } = membersData
</script>

<style src="./styles/CVPage.css" scoped></style>
