<template>
  <main class="publications-page">
    <PageHeader eyebrow="Publications" title="Publications" description="" />
    <SignalDivider />

    <div class="content-layout">
      <!-- 1. 모바일 전용: 드롭다운 트리거 버튼 및 모달 메뉴 -->
      <div class="mobile-filter-wrapper">
        <button class="mobile-filter-btn" @click="isMobileMenuOpen = !isMobileMenuOpen">
          <span class="label">Year</span>
          <span class="current">{{ selectedYear === 'all' ? 'All Years' : selectedYear }}</span>
          <span class="arrow" :class="{ open: isMobileMenuOpen }">▾</span>
        </button>

        <!-- 모바일 드롭다운 메뉴 (열렸을 때) -->
        <div v-if="isMobileMenuOpen" class="mobile-dropdown">
          <button class="mobile-opt" :class="{ active: selectedYear === 'all' }" @click="selectYear('all')">
            All Years
          </button>
          <button v-for="y in years" :key="y" class="mobile-opt" :class="{ active: selectedYear === y }"
            @click="selectYear(y)">
            {{ y }}
          </button>
        </div>
      </div>

      <!-- 2. 데스크톱 전용: 왼쪽 세로 네비게이션 사이드바 -->
      <aside class="desktop-sidebar">
        <span class="sidebar-title">FILTER BY YEAR</span>
        <nav class="year-nav">
          <button class="year-link" :class="{ active: selectedYear === 'all' }" @click="selectedYear = 'all'">
            All
          </button>
          <button v-for="y in years" :key="y" class="year-link" :class="{ active: selectedYear === y }"
            @click="selectedYear = y">
            {{ y }}
          </button>
        </nav>
      </aside>

      <!-- 3. 논문 리스트 본문 영역 -->
      <section class="list-section">
        <AdminAddButton v-if="isAdmin" label="Add publication" @add="startAdd" />

        <ul v-if="filteredPublications.length">
          <li v-for="pub in filteredPublications" :key="pub.id" class="pub-row">
            <PublicationItem :year="pub.year" :title="pub.title" :authors="pub.authors" :venue="pub.venue"
              :link="pub.link" :images="pub.images" />
            <AdminEditControls v-if="isAdmin" @edit="startEdit(pub)" @delete="deletePub(pub)" />
          </li>
        </ul>
        <p v-else class="empty">No papers found for {{ selectedYear }}.</p>
      </section>
    </div>

    <div v-if="editingId" class="edit-modal-backdrop" @click.self="cancelEdit">
      <div class="edit-modal">
        <label class="field"><span>Year</span><input v-model="draft.year" /></label>
        <label class="field"><span>Title</span><input v-model="draft.title" /></label>
        <label class="field"><span>Authors</span><input v-model="draft.authors" /></label>
        <label class="field"><span>Venue</span><input v-model="draft.venue" /></label>
        <label class="field"><span>Link (optional)</span><input v-model="draft.link" /></label>
        <div class="edit-actions">
          <button type="button" class="save-btn" @click="saveEdit">Save</button>
          <button type="button" class="cancel-btn" @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import PublicationItem from '../components/PublicationItem.vue'
import SignalDivider from '../components/SignalDivider.vue'
import AdminEditControls from '../components/AdminEditControls.vue'
import AdminAddButton from '../components/AdminAddButton.vue'
import { useAdminMode } from '../composables/useAdminMode'
import { saveJsonFile } from '../services/localSave'
import publicationsDataRaw from '../data/publications.json'

interface Publication {
  id: string
  year: string
  title: string
  authors: string
  venue: string
  link?: string
  images?: string[]
}

const { isAdmin } = useAdminMode()

// 원본 순서 그대로 유지되는 로컬 사본. 화면 표시는 이걸 뒤집어서(최신순) 보여줍니다.
const localPubs = reactive<Publication[]>(JSON.parse(JSON.stringify(publicationsDataRaw)))
const publications = computed(() => [...localPubs].reverse())

const selectedYear = ref('all')
const isMobileMenuOpen = ref(false)

const years = computed(() => Array.from(new Set(publications.value.map((p) => p.year))))

const filteredPublications = computed(() =>
  selectedYear.value === 'all'
    ? publications.value
    : publications.value.filter((p) => p.year === selectedYear.value)
)

const selectYear = (y: string) => {
  selectedYear.value = y
  isMobileMenuOpen.value = false
}

const editingId = ref<string | 'new' | null>(null)
const draft = reactive({ year: '', title: '', authors: '', venue: '', link: '' })

function startEdit(pub: Publication) {
  editingId.value = pub.id
  draft.year = pub.year
  draft.title = pub.title
  draft.authors = pub.authors
  draft.venue = pub.venue
  draft.link = pub.link ?? ''
}

function startAdd() {
  editingId.value = 'new'
  draft.year = ''
  draft.title = ''
  draft.authors = ''
  draft.venue = ''
  draft.link = ''
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit() {
  if (editingId.value === 'new') {
    const id = 'pub' + Date.now()
    localPubs.push({ id, year: draft.year, title: draft.title, authors: draft.authors, venue: draft.venue, link: draft.link })
  } else {
    const target = localPubs.find((p) => p.id === editingId.value)
    if (target) {
      target.year = draft.year
      target.title = draft.title
      target.authors = draft.authors
      target.venue = draft.venue
      target.link = draft.link
    }
  }

  cancelEdit()
  await saveJsonFile('publications.json', localPubs)
}

async function deletePub(pub: Publication) {
  const idx = localPubs.findIndex((p) => p.id === pub.id)
  if (idx !== -1) localPubs.splice(idx, 1)
  await saveJsonFile('publications.json', localPubs)
}
</script>

<style src="./styles/PublicationsPage.css" scoped></style>