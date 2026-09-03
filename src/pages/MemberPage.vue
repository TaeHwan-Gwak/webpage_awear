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
          <p class="bio">{{ pi.bio }}</p>
          <a class="mail" :href="`mailto:${pi.email}`">{{ pi.email }}</a>
        </div>
      </div>
    </section>

    <section class="group section">
      <h2 class="group-title">{{ groupTitle }}</h2>
      <div class="grid">
        <MemberCard
          v-for="member in members"
          :key="member.id"
          :name="member.name"
          :role="member.role"
          :note="member.note"
        />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
import SignalDivider from '../components/SignalDivider.vue'
import MemberCard from '../components/MemberCard.vue'
import membersData from '../data/members.json'

const { pi, groupTitle, members } = membersData
</script>

<style src="./styles/MemberPage.css" scoped></style>
