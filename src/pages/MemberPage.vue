<template>
  <main class="member-page">
    <PageHeader eyebrow="Member" title="Page title" description="Page description" />

    <SignalDivider />

    <section class="pi-feature section">
      <div class="card">
        <div class="portrait" aria-hidden="true">
          <span class="ph-label">Image</span>
        </div>
        <div class="body">
          <p class="eyebrow">Principal Investigator</p>
          <h2>{{ pi.name }}</h2>
          <p class="role">{{ pi.role }}</p>
          <div class="actions">
            <a class="mail" :href="`mailto:${pi.email}`">{{ pi.email }}</a>
            <router-link class="cv-btn" to="/member/cv">View CV →</router-link>
          </div>
        </div>
      </div>
    </section>

    <section v-if="postdocs?.length" class="group section">
      <h2 class="group-title">Postdoctoral Researchers</h2>
      <div class="grid">
        <MemberCard v-for="member in postdocs" :key="member.id" :name="member.name" :role="member.role"
          :note="member.note" />
      </div>
    </section>

    <section class="group section">
      <h2 class="group-title">{{ groupTitle }}</h2>
      <div class="grid">
        <MemberCard v-for="member in members" :key="member.id" :name="member.name" :role="member.role"
          :note="member.note" />
      </div>
    </section>

    <section v-if="alumni?.length" class="group alumni section">
      <h2 class="group-title">{{ alumniTitle ?? 'Alumni' }}</h2>
      <ul class="alumni-list">
        <AlumniItem v-for="member in alumni" :key="member.id" :name="member.name" :role="member.role"
          :note="member.note" />
      </ul>
    </section>
  </main>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import SignalDivider from '../components/SignalDivider.vue'
import MemberCard from '../components/MemberCard.vue'
import AlumniItem from '../components/AlumniItem.vue'
import membersData from '../data/members.json'

const { pi, postdocs, groupTitle, members, alumniTitle, alumni } = membersData
</script>

<style src="./styles/MemberPage.css" scoped></style>
