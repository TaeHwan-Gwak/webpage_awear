<template>
  <main class="cv-page">
    <header class="cv-header section">
      <router-link class="back-link" to="/member">← Back to Member</router-link>
      <p class="eyebrow">Curriculum Vitae</p>

      <div class="cv-header-row">
        <div class="cv-header-text">
          <h1>
            {{ subject.name }}
            <span v-if="subject.nameKr" class="name-kr">({{ subject.nameKr }})</span>
          </h1>
          <p class="role">{{ subject.role }}</p>
          <p v-if="subject.badge" class="badge">{{ subject.badge }}</p>
          <p v-if="subject.department" class="dept">{{ subject.department }}</p>
          <p class="inst">{{ subject.institution }}</p>
          <a class="mail" :href="`mailto:${subject.email}`">{{ subject.email }}</a>
        </div>

        <div class="cv-photo">
          <img v-if="subject.photo" :src="subject.photo" :alt="subject.name" fetchpriority="high"
            :style="{ objectPosition: `center ${subject.photoPosition ?? 50}%` }" />
          <span v-else class="ph-label">Image</span>
        </div>
      </div>
    </header>

    <section v-if="subject.cv?.length" class="cv-content section">
      <div v-for="block in subject.cv" :key="block.section" class="cv-block">
        <h2>{{ block.section }}</h2>
        <ul>
          <li v-for="(item, i) in block.items" :key="i">
            <template v-if="typeof item === 'string'">{{ item }}</template>
            <div v-else class="cv-entry">
              <span class="cv-year">{{ item.year }}</span>
              <span class="cv-entry-text">
                <span class="cv-entry-title">{{ item.title }}</span>
                <span v-if="item.subtitle" class="cv-entry-subtitle">{{ item.subtitle }}</span>
              </span>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import membersData from '../data/members.json'

type CvEntry = string | { year: string; title: string; subtitle?: string }
interface CvBlock {
  section: string
  items: CvEntry[]
}
interface CvSubject {
  name: string
  nameKr?: string
  role: string
  badge?: string
  department?: string
  institution: string
  email: string
  photo?: string
  photoPosition?: number
  cv?: CvBlock[]
}

const route = useRoute()

const subject = computed<CvSubject>(() => {
  const id = route.params.id as string | undefined
  if (id && id !== 'pi') {
    const postdoc = membersData.postdocs?.find((p) => p.id === id) as
      | (typeof membersData.postdocs[number] & { institution?: string; cv?: CvBlock[] })
      | undefined
    if (postdoc) {
      return {
        name: postdoc.name,
        role: postdoc.role,
        badge: postdoc.note || undefined,
        institution: postdoc.institution ?? '',
        email: postdoc.email,
        photo: postdoc.photo,
        photoPosition: postdoc.photoPosition,
        cv: postdoc.cv,
      }
    }
  }
  const pi = membersData.pi
  return {
    name: pi.name,
    nameKr: pi.nameKr,
    role: pi.role,
    department: pi.department,
    institution: pi.institution,
    email: pi.email,
    photo: pi.photo,
    photoPosition: pi.photoPosition,
    cv: pi.cv,
  }
})
</script>

<style src="./styles/CVPage.css" scoped></style>
