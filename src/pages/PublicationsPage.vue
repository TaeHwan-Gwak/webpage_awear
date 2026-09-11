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
          <li v-for="(pub, i) in filteredPublications" :key="pub.id" class="pub-row"
            :class="{ dragging: draggedPubIndex === i }" :draggable="isAdmin && selectedYear === 'all'"
            @dragstart="pubOnDragStart(i)" @dragover="pubOnDragOver($event)" @drop="pubOnDrop(i)"
            @dragend="pubOnDragEnd">
            <DragHandle v-if="selectedYear === 'all'" class="handle" />
            <PublicationItem :year="pub.year" :title="pub.title" :authors="pub.authors" :venue="pub.venue"
              :link="pub.link" :images="pub.images" />
            <AdminEditControls v-if="isAdmin" @edit="startEdit(pub)" @delete="deletePub(pub)" />
          </li>
        </ul>
        <p v-else class="empty">No papers found for {{ selectedYear }}.</p>
        <p v-if="isAdmin && selectedYear !== 'all'" class="drag-hint">Switch to "All" to reorder papers.</p>
      </section>
    </div>

    <div v-if="editingId" class="edit-modal-backdrop" @click.self="cancelEdit">
      <div class="edit-modal">
        <label class="field"><span>Year</span><input v-model="draft.year" /></label>
        <label class="field"><span>Title</span><input v-model="draft.title" /></label>
        <label class="field"><span>Authors</span><input v-model="draft.authors" /></label>
        <label class="field"><span>Venue</span><input v-model="draft.venue" /></label>
        <label class="field"><span>Link (optional)</span><input v-model="draft.link" /></label>

        <div class="field">
          <span>Images</span>
          <div class="image-list">
            <div v-for="src in draft.images" :key="src" class="image-thumb">
              <img :src="src" alt="" />
              <button type="button" class="remove-image-btn" aria-label="Remove image" @click="removeImage(src)">✕</button>
            </div>
          </div>
          <label class="upload-btn">
            {{ uploading ? 'Uploading…' : '+ Upload image' }}
            <input type="file" accept="image/*" :disabled="uploading" @change="onFileSelected" />
          </label>
        </div>

        <p v-if="formError" class="form-error">{{ formError }}</p>
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
import DragHandle from '../components/DragHandle.vue'
import { useAdminMode } from '../composables/useAdminMode'
import { saveJsonFile, uploadImage, deleteImage } from '../services/localSave'
import { nextSequentialId } from '../utils/nextId'
import { renumberIds, renameMultiImageField } from '../utils/renumber'
import { checkRequired } from '../utils/validate'
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

const editingId = ref<string | null>(null)
const isNew = ref(false)
const uploading = ref(false)
const formError = ref<string | null>(null)
const draft = reactive({ year: '', title: '', authors: '', venue: '', link: '', images: [] as string[] })

function startEdit(pub: Publication) {
  editingId.value = pub.id
  isNew.value = false
  formError.value = null
  draft.year = pub.year
  draft.title = pub.title
  draft.authors = pub.authors
  draft.venue = pub.venue
  draft.link = pub.link ?? ''
  draft.images = [...(pub.images ?? [])]
}

function startAdd() {
  // 이미지 업로드 시 id 기준으로 파일명을 붙여야 해서, 저장 전에 id를 미리 만들어둡니다.
  editingId.value = nextSequentialId(localPubs.map((p) => p.id), 'pub')
  isNew.value = true
  formError.value = null
  draft.year = ''
  draft.title = ''
  draft.authors = ''
  draft.venue = ''
  draft.link = ''
  draft.images = []
}

function cancelEdit() {
  editingId.value = null
  formError.value = null
}

async function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !editingId.value) return

  uploading.value = true
  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${editingId.value}-${draft.images.length + 1}.${ext}`
  const path = await uploadImage('publications', filename, file)
  uploading.value = false

  if (path) draft.images.push(path)
  else alert('Image upload failed. Is the local dev server running?')
}

async function removeImage(src: string) {
  draft.images = draft.images.filter((s) => s !== src)
  await deleteImage(src)
}

async function saveEdit() {
  const requiredError = checkRequired({ Year: draft.year, Title: draft.title, Authors: draft.authors, Venue: draft.venue })
  if (requiredError) {
    formError.value = requiredError
    return
  }

  if (isNew.value) {
    localPubs.push({
      id: editingId.value!,
      year: draft.year,
      title: draft.title,
      authors: draft.authors,
      venue: draft.venue,
      link: draft.link,
      images: draft.images,
    })
  } else {
    const target = localPubs.find((p) => p.id === editingId.value)
    if (target) {
      target.year = draft.year
      target.title = draft.title
      target.authors = draft.authors
      target.venue = draft.venue
      target.link = draft.link
      target.images = draft.images
    }
  }

  cancelEdit()
  await saveJsonFile('publications.json', localPubs)
}

async function deletePub(pub: Publication) {
  const idx = localPubs.findIndex((p) => p.id === pub.id)
  if (idx !== -1) localPubs.splice(idx, 1)
  await Promise.all((pub.images ?? []).map((src) => deleteImage(src)))
  await saveJsonFile('publications.json', localPubs)
}

// publications는 localPubs를 뒤집은(최신순) 배열이라, 드래그로 옮긴 위치를
// 실제 localPubs 배열의 인덱스로 다시 변환해줘야 합니다. 연도 필터가 걸려있으면
// (부분집합만 보여서 위치 매핑이 애매해지므로) 재정렬은 "All"일 때만 허용합니다.
const draggedPubIndex = ref<number | null>(null)

function pubOnDragStart(i: number) {
  draggedPubIndex.value = i
}

function pubOnDragOver(e: DragEvent) {
  e.preventDefault()
}

async function pubOnDrop(targetIndex: number) {
  const from = draggedPubIndex.value
  draggedPubIndex.value = null
  if (from === null || from === targetIndex || selectedYear.value !== 'all') return

  const total = localPubs.length
  const fromLocal = total - 1 - from
  const toLocal = total - 1 - targetIndex

  const [moved] = localPubs.splice(fromLocal, 1)
  localPubs.splice(toLocal, 0, moved)

  const changes = renumberIds(localPubs, 'pub')
  await renameMultiImageField(localPubs, changes)
  await saveJsonFile('publications.json', localPubs)
}

function pubOnDragEnd() {
  draggedPubIndex.value = null
}
</script>

<style src="./styles/PublicationsPage.css" scoped></style>