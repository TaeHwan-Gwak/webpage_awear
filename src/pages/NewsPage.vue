<template>
  <main class="news-page">
    <PageHeader eyebrow="News" title="News" description="" />

    <SignalDivider />

    <section class="list section">
      <p v-if="error" class="status">Couldn't load the latest news, showing previous content instead.</p>

      <div v-if="!loading" class="list-controls">
        <span class="count">{{ displayNews.length }} total</span>

        <!-- 커스텀 드롭다운 -->
        <div class="custom-select-wrapper" ref="dropdownRef">
          <span class="label">Per page</span>
          <button type="button" class="select-trigger" :class="{ open: isOpen }" @click="isOpen = !isOpen">
            <span>{{ pageSize }}</span>
            <span class="chevron" :class="{ rotated: isOpen }">▾</span>
          </button>

          <ul v-if="isOpen" class="dropdown-menu">
            <li v-for="size in [5, 10, 20]" :key="size" class="dropdown-item" :class="{ selected: pageSize === size }"
              @click="selectSize(size)">
              {{ size }}
            </li>
          </ul>
        </div>
      </div>

      <AdminAddButton v-if="isEditable" label="Add news item" @add="startAdd" />

      <ol class="timeline">
        <template v-if="loading">
          <li v-for="n in 6" :key="n" class="skeleton-entry">
            <SkeletonLoader width="70px" height="14px" />
            <SkeletonLoader width="70%" height="15px" />
          </li>
        </template>
        <template v-else>
          <li v-if="isNewItem" class="news-edit-row">
            <input v-model="draft.date" placeholder="Date (e.g. 2026.01)" />
            <input v-model="draft.tag" placeholder="Tag (e.g. General)" />
            <textarea v-model="draft.desc" rows="3" placeholder="Description"></textarea>
            <input v-model="draft.link" placeholder="Link (optional)" />
            <div class="image-field">
              <div v-if="draft.image" class="photo-preview">
                <img :src="draft.image" alt="" />
                <button type="button" class="remove-image-btn" aria-label="Remove image" @click="removeNewsImage">✕</button>
              </div>
              <label class="upload-btn">
                {{ uploadingImage ? 'Uploading…' : '+ Upload image' }}
                <input type="file" accept="image/*" :disabled="uploadingImage" @change="onImageSelected" />
              </label>
            </div>
            <p v-if="formError" class="form-error">{{ formError }}</p>
            <div class="edit-actions">
              <button type="button" class="save-btn" @click="saveEdit">Save</button>
              <button type="button" class="cancel-btn" @click="cancelEdit">Cancel</button>
            </div>
          </li>

          <template v-for="(item, i) in pagedNews" :key="item.id ?? item.date">
            <li v-if="editingId === item.id" class="news-edit-row">
              <input v-model="draft.date" placeholder="Date (e.g. 2026.01)" />
              <input v-model="draft.tag" placeholder="Tag (e.g. General)" />
              <textarea v-model="draft.desc" rows="3" placeholder="Description"></textarea>
              <input v-model="draft.link" placeholder="Link (optional)" />
              <div class="image-field">
                <div v-if="draft.image" class="photo-preview">
                  <img :src="draft.image" alt="" />
                  <button type="button" class="remove-image-btn" aria-label="Remove image" @click="removeNewsImage">✕</button>
                </div>
                <label class="upload-btn">
                  {{ uploadingImage ? 'Uploading…' : '+ Upload image' }}
                  <input type="file" accept="image/*" :disabled="uploadingImage" @change="onImageSelected" />
                </label>
              </div>
              <p v-if="formError" class="form-error">{{ formError }}</p>
              <div class="edit-actions">
                <button type="button" class="save-btn" @click="saveEdit">Save</button>
                <button type="button" class="cancel-btn" @click="cancelEdit">Cancel</button>
              </div>
            </li>
            <li v-else class="news-row">
              <NewsItem class="news-row-content" :index="displayNews.length - ((currentPage - 1) * pageSize + i)"
                :date="item.date" :desc="item.desc" :tag="item.tag" :link="item.link" :image="item.image" />
              <AdminEditControls v-if="isEditable" @edit="startEdit(item)" @delete="deleteItem(item)" />
            </li>
          </template>
        </template>
      </ol>

      <nav v-if="!loading && totalPages > 1" class="pagination" aria-label="News pagination">
        <button type="button" class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
          Prev
        </button>
        <button v-for="p in totalPages" :key="p" type="button" class="page-btn" :class="{ active: p === currentPage }"
          @click="currentPage = p">
          {{ p }}
        </button>
        <button type="button" class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
          Next
        </button>
      </nav>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import NewsItem from '../components/NewsItem.vue'
import AdminEditControls from '../components/AdminEditControls.vue'
import AdminAddButton from '../components/AdminAddButton.vue'
import { useNews, type NewsItem as NewsItemType } from '../composables/useNews'
import { useAdminMode } from '../composables/useAdminMode'
import { saveJsonFile, uploadImage, deleteImage } from '../services/localSave'
import { nextSequentialId } from '../utils/nextId'
import { checkRequired } from '../utils/validate'
import SignalDivider from '../components/SignalDivider.vue'
import newsDataRaw from '../data/news.json'

const { news, loading, error } = useNews(200)
const { isAdmin } = useAdminMode()

// 로컬 news.json 사본. 어드민 편집은 이 배열을 고치고 저장 API로 파일에 반영합니다.
const localNews = ref<NewsItemType[]>([...(newsDataRaw as NewsItemType[])])

// Firestore에 실제 데이터가 있으면 그 목록을 그대로 보여주고 편집은 막습니다 —
// 이 화면의 저장 기능은 로컬 news.json으로만 반영되기 때문입니다.
const isEditable = computed(() => isAdmin.value && !news.value.length)

const displayNews = computed(() =>
  news.value.length ? news.value : [...localNews.value].reverse()
)

const editingId = ref<string | null>(null)
const isNewItem = ref(false)
const uploadingImage = ref(false)
const formError = ref<string | null>(null)
const draft = reactive({ date: '', tag: '', desc: '', link: '', image: '' })

function startEdit(item: NewsItemType) {
  editingId.value = item.id ?? null
  isNewItem.value = false
  formError.value = null
  draft.date = item.date
  draft.tag = item.tag ?? ''
  draft.desc = item.desc
  draft.link = item.link ?? ''
  draft.image = item.image ?? ''
}

function startAdd() {
  // 이미지 업로드 시 id 기준 파일명이 필요해서, 저장 전에 미리 id를 만들어둡니다.
  editingId.value = nextSequentialId(localNews.value.map((n) => n.id ?? ''), 'n')
  isNewItem.value = true
  formError.value = null
  draft.date = ''
  draft.tag = ''
  draft.desc = ''
  draft.link = ''
  draft.image = ''
}

function cancelEdit() {
  editingId.value = null
  formError.value = null
}

async function onImageSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !editingId.value) return

  uploadingImage.value = true
  const ext = file.name.split('.').pop() || 'jpg'
  const path = await uploadImage('news', `${editingId.value}.${ext}`, file)
  uploadingImage.value = false

  if (path) draft.image = path
  else alert('Image upload failed. Is the local dev server running?')
}

async function removeNewsImage() {
  if (draft.image) await deleteImage(draft.image)
  draft.image = ''
}

async function saveEdit() {
  if (!editingId.value) return

  const requiredError = checkRequired({ Date: draft.date, Description: draft.desc })
  if (requiredError) {
    formError.value = requiredError
    return
  }

  if (isNewItem.value) {
    localNews.value.push({
      id: editingId.value,
      date: draft.date,
      tag: draft.tag,
      desc: draft.desc,
      link: draft.link,
      image: draft.image,
    })
  } else {
    const target = localNews.value.find((n) => n.id === editingId.value)
    if (target) {
      target.date = draft.date
      target.tag = draft.tag
      target.desc = draft.desc
      target.link = draft.link
      target.image = draft.image
    }
  }
  editingId.value = null
  await saveJsonFile('news.json', localNews.value)
}

async function deleteItem(item: NewsItemType) {
  localNews.value = localNews.value.filter((n) => n.id !== item.id)
  if (item.image) await deleteImage(item.image)
  await saveJsonFile('news.json', localNews.value)
}

const isMobile = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(max-width: 768px)').matches ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent))

const pageSize = ref(isMobile() ? 5 : 20)
const currentPage = ref(1)

// 커스텀 드롭다운 상태
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const selectSize = (size: number) => {
  pageSize.value = size
  isOpen.value = false
}

const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  if (isMobile()) {
    pageSize.value = 5
  }
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

const totalPages = computed(() => Math.max(1, Math.ceil(displayNews.value.length / pageSize.value)))

const pagedNews = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return displayNews.value.slice(start, start + pageSize.value)
})

watch([pageSize, displayNews], () => {
  currentPage.value = 1
})
</script>

<style src="./styles/NewsPage.css" scoped></style>