<template>
  <main class="equipment-page">
    <PageHeader eyebrow="Equipment" title="Equipment" description="" />

    <SignalDivider />

    <section class="equipment-grid section">
      <div class="grid">
        <figure v-for="item in equipment" :key="item.id" class="equipment-card">
          <div class="thumb">
            <img
              v-if="item.image && !brokenIds.has(item.id)"
              :src="item.image"
              :alt="item.name"
              loading="lazy"
              @error="brokenIds.add(item.id)"
            />
            <span v-else class="ph-label">Image</span>
          </div>
          <figcaption class="name">{{ item.name }}</figcaption>
        </figure>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import SignalDivider from '../components/SignalDivider.vue'
import equipmentData from '../data/equipment.json'

const equipment = equipmentData
const brokenIds = reactive(new Set<string>())
</script>

<style src="./styles/EquipmentPage.css" scoped></style>
