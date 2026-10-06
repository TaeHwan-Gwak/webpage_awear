<template>
  <main>
    <section id="top" class="hero">
      <div class="hero-photo">
        <HeroCarousel :images="form.heroImages" />
      </div>

      <div class="hero-text section">
        <AdminEditControls v-if="isAdmin" class="hero-edit-btn" hide-delete @edit="startHeroEdit" />
        <p class="eyebrow">{{ form.heroEyebrow }}</p>
        <h1>{{ form.heroTitle }}</h1>
        <p class="lede">{{ form.lede }}</p>
        <p class="lede lede-en">{{ form.ledeEn }}</p>
      </div>

      <div v-if="isAdmin" class="hero-images-admin section">
        <span class="admin-label">Hero photos (admin only)</span>
        <div class="hero-thumbs">
          <div v-for="(img, i) in form.heroImages" :key="img + i" class="hero-thumb"
            :class="{ dragging: heroDrag.draggedIndex.value === i }" draggable="true"
            @dragstart="heroDrag.onDragStart(i)" @dragover="heroDrag.onDragOver(i, $event)"
            @drop="heroDrag.onDrop(i)" @dragend="heroDrag.onDragEnd">
            <img :src="img" alt="" />
            <button type="button" class="tile-remove-btn" aria-label="Remove photo" @click="removeHeroImage(i)">✕</button>
          </div>
          <label class="hero-thumb add-slot">
            {{ heroImageUploading ? 'Uploading…' : '+ Add photo' }}
            <input type="file" accept="image/*" :disabled="heroImageUploading" @change="addHeroImage" />
          </label>
        </div>
      </div>
    </section>

    <SignalDivider />

    <section id="media" class="media section">
      <header class="head">
        <p class="eyebrow">Recent Media</p>
      </header>

      <AdminAddButton v-if="isAdmin" label="Add media item" @add="startMediaAdd" />

      <div v-if="form.recentMedia.length" class="media-feature">
        <div class="media-main" :class="{ dragging: mediaDrag.draggedIndex.value === 0 }" :draggable="isAdmin"
          @dragstart="mediaDrag.onDragStart(0)" @dragover="mediaDrag.onDragOver(0, $event)"
          @drop="mediaDrag.onDrop(0)" @dragend="mediaDrag.onDragEnd">
          <DragHandle v-if="isAdmin" class="handle" />
          <div class="thumb" aria-hidden="true">
            <img v-if="form.recentMedia[0].image" :src="form.recentMedia[0].image" alt="" />
            <span v-else class="ph-label">Image</span>
          </div>
          <p class="media-title">{{ form.recentMedia[0].title }}</p>
          <a v-if="form.recentMedia[0].link" class="media-visit" :href="form.recentMedia[0].link" target="_blank"
            rel="noopener">Read more →</a>
          <AdminEditControls v-if="isAdmin" @edit="startMediaEdit(form.recentMedia[0])"
            @delete="deleteMedia(form.recentMedia[0])" />
        </div>

        <div class="media-secondary">
          <div v-for="(item, i) in form.recentMedia.slice(1)" :key="item.id" class="media-item"
            :class="{ dragging: mediaDrag.draggedIndex.value === i + 1 }" :draggable="isAdmin"
            @dragstart="mediaDrag.onDragStart(i + 1)" @dragover="mediaDrag.onDragOver(i + 1, $event)"
            @drop="mediaDrag.onDrop(i + 1)" @dragend="mediaDrag.onDragEnd">
            <DragHandle v-if="isAdmin" class="handle" />
            <div class="thumb" aria-hidden="true">
              <img v-if="item.image" :src="item.image" alt="" />
              <span v-else class="ph-label">Image</span>
            </div>
            <div class="media-item-body">
              <p class="media-title">{{ item.title }}</p>
              <a v-if="item.link" class="media-visit" :href="item.link" target="_blank" rel="noopener">Read more →</a>
            </div>
            <AdminEditControls v-if="isAdmin" @edit="startMediaEdit(item)" @delete="deleteMedia(item)" />
          </div>
        </div>
      </div>
    </section>

    <SignalDivider />

    <section id="gallery" class="gallery section">
      <header class="head">
        <p class="eyebrow">Gallery</p>
        <h2>Glimpses of our Research</h2>
      </header>

      <div class="gallery-slider">
        <button type="button" class="slide-btn prev" aria-label="Previous" :disabled="galleryIndex === 0"
          @click="galleryPrev">‹</button>

        <div class="gallery-track-wrap">
          <div class="gallery-track" :style="{ transform: `translateX(calc(-${galleryIndex * (100 / galleryVisible)}% - ${galleryIndex * (GALLERY_GAP_PX / galleryVisible)}px))` }">
            <div v-for="(item, i) in form.gallery" :key="item.id" class="gallery-item"
              :class="{ dragging: galleryDrag.draggedIndex.value === i }" :draggable="isAdmin"
              @dragstart="galleryDrag.onDragStart(i)" @dragover="galleryDrag.onDragOver(i, $event)"
              @drop="galleryDrag.onDrop(i)" @dragend="galleryDrag.onDragEnd">
              <img v-if="item.image" :src="item.image" alt="" />
              <span v-else class="ph-label">Image</span>

              <template v-if="isAdmin">
                <label class="tile-upload-btn">
                  {{ galleryUploadingId === item.id ? 'Uploading…' : item.image ? 'Replace' : '+ Upload' }}
                  <input type="file" accept="image/*" @change="onGalleryImageSelected(item.id, $event)" />
                </label>
                <button type="button" class="tile-remove-btn" aria-label="Remove image"
                  @click="removeGalleryItem(item)">✕</button>
              </template>
            </div>

            <button v-if="isAdmin" type="button" class="gallery-item add-slot" @click="addGalleryItem">
              + Add image
            </button>
          </div>
        </div>

        <button type="button" class="slide-btn next" aria-label="Next" :disabled="galleryIndex >= galleryMaxIndex"
          @click="galleryNext">›</button>
      </div>
    </section>

    <SignalDivider />

    <section id="ongoing" class="ongoing section">
      <header class="head">
        <p class="eyebrow">On-going Projects</p>
      </header>

      <template v-if="!isMobileOngoing">
        <AdminAddButton v-if="isAdmin" label="Add project" @add="startProjectAdd" />

        <div class="projects-grid">
          <div v-for="(item, i) in form.ongoingProjects" :key="item.id" class="project-card"
            :class="{ dragging: projectsDrag.draggedIndex.value === i }" :draggable="isAdmin"
            @dragstart="projectsDrag.onDragStart(i)" @dragover="projectsDrag.onDragOver(i, $event)"
            @drop="projectsDrag.onDrop(i)" @dragend="projectsDrag.onDragEnd">
            <DragHandle v-if="isAdmin" class="handle" />
            <div class="thumb" aria-hidden="true">
              <img v-if="item.image" :src="item.image" alt="" />
              <span v-else class="ph-label">Image</span>
            </div>
            <p class="title">{{ item.title }}</p>
            <AdminEditControls v-if="isAdmin" @edit="startProjectEdit(item)" @delete="deleteProject(item)" />
          </div>
        </div>
      </template>

      <div v-else class="projects-feature">
        <div class="project-main">
          <div class="thumb" aria-hidden="true">
            <img v-if="form.ongoingProjects[featuredProject]?.image" :src="form.ongoingProjects[featuredProject].image"
              alt="" />
            <span v-else class="ph-label">Image</span>
          </div>
          <p class="title">{{ form.ongoingProjects[featuredProject]?.title }}</p>
        </div>

        <div class="projects-secondary">
          <button v-for="entry in otherProjects" :key="entry.item.id" type="button" class="project-mini"
            @click="selectProject(entry.i)">
            <span class="thumb-sm" aria-hidden="true">
              <img v-if="entry.item.image" :src="entry.item.image" alt="" />
            </span>
            <span class="title-sm">{{ entry.item.title }}</span>
          </button>
        </div>
      </div>
    </section>

    <SignalDivider />

    <section id="news" class="news section">
      <header class="head">
        <p class="eyebrow">News</p>
      </header>

      <p v-if="newsError" class="status">Couldn't load the latest news, showing previous content instead.</p>

      <ol class="timeline">
        <template v-if="newsLoading">
          <li v-for="n in 3" :key="n" class="skeleton-entry">
            <SkeletonLoader width="70px" height="14px" />
            <SkeletonLoader width="80%" height="15px" />
          </li>
        </template>
        <template v-else>
          <li v-for="item in displayNews" :key="item.id ?? item.date" class="news-row">
            <NewsItem :date="item.date" :desc="item.desc">
              <a v-if="item.link" class="read-more" :href="item.link" target="_blank" rel="noopener">Read more →</a>
            </NewsItem>
          </li>
        </template>
      </ol>

      <router-link class="go-to-news" to="/news">Go to News →</router-link>
    </section>

    <div v-if="heroEditing" class="edit-modal-backdrop" @click.self="cancelHeroEdit">
      <div class="edit-modal">
        <label class="field"><span>Eyebrow label</span><input v-model="heroDraft.eyebrow" /></label>
        <label class="field"><span>Title</span><input v-model="heroDraft.title" /></label>
        <label class="field"><span>Lede (Korean)</span><textarea v-model="heroDraft.lede" rows="6"></textarea></label>
        <label class="field"><span>Lede (English)</span><textarea v-model="heroDraft.ledeEn" rows="6"></textarea></label>
        <div class="edit-actions">
          <button type="button" class="save-btn" @click="saveHeroEdit">Save</button>
          <button type="button" class="cancel-btn" @click="cancelHeroEdit">Cancel</button>
        </div>
      </div>
    </div>

    <div v-if="mediaEditingId" class="edit-modal-backdrop" @click.self="cancelMediaEdit">
      <div class="edit-modal">
        <label class="field"><span>Title</span><textarea v-model="mediaDraft.title" rows="3"></textarea></label>
        <label class="field"><span>Link (optional)</span><input v-model="mediaDraft.link" placeholder="https://…" /></label>
        <div class="field">
          <span>Image</span>
          <div v-if="mediaDraft.image" class="photo-preview">
            <img :src="mediaDraft.image" alt="" />
            <button type="button" class="remove-image-btn" aria-label="Remove image" @click="removeMediaImage">✕</button>
          </div>
          <label class="upload-btn">
            {{ mediaUploading ? 'Uploading…' : '+ Upload image' }}
            <input type="file" accept="image/*" :disabled="mediaUploading" @change="onMediaImageSelected" />
          </label>
        </div>
        <p v-if="mediaFormError" class="form-error">{{ mediaFormError }}</p>
        <div class="edit-actions">
          <button type="button" class="save-btn" @click="saveMediaEdit">Save</button>
          <button type="button" class="cancel-btn" @click="cancelMediaEdit">Cancel</button>
        </div>
      </div>
    </div>

    <div v-if="projectEditingId" class="edit-modal-backdrop" @click.self="cancelProjectEdit">
      <div class="edit-modal">
        <label class="field"><span>Title</span><textarea v-model="projectDraft.title" rows="3"></textarea></label>
        <div class="field">
          <span>Image</span>
          <div v-if="projectDraft.image" class="photo-preview">
            <img :src="projectDraft.image" alt="" />
            <button type="button" class="remove-image-btn" aria-label="Remove image" @click="removeProjectImage">✕</button>
          </div>
          <label class="upload-btn">
            {{ projectUploading ? 'Uploading…' : '+ Upload image' }}
            <input type="file" accept="image/*" :disabled="projectUploading" @change="onProjectImageSelected" />
          </label>
        </div>
        <p v-if="projectFormError" class="form-error">{{ projectFormError }}</p>
        <div class="edit-actions">
          <button type="button" class="save-btn" @click="saveProjectEdit">Save</button>
          <button type="button" class="cancel-btn" @click="cancelProjectEdit">Cancel</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import SignalDivider from '../components/SignalDivider.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import NewsItem from '../components/NewsItem.vue'
import HeroCarousel from '../components/HeroCarousel.vue'
import AdminEditControls from '../components/AdminEditControls.vue'
import AdminAddButton from '../components/AdminAddButton.vue'
import DragHandle from '../components/DragHandle.vue'
import { useNews, type NewsItem as NewsItemType } from '../composables/useNews'
import { useAdminMode } from '../composables/useAdminMode'
import { useDragReorder } from '../composables/useDragReorder'
import { useEscapeKey } from '../composables/useEscapeKey'
import { saveJsonFile, uploadImage, deleteImage } from '../services/localSave'
import { nextSequentialId } from '../utils/nextId'
import { checkRequired } from '../utils/validate'
import newsDataRaw from '../data/news.json'
import homeDataRaw from '../data/home.json'

interface MediaItem {
  id: string
  title: string
  link: string
  image?: string
}

interface ProjectItem {
  id: string
  title: string
  image?: string
}

interface GalleryItem {
  id: string
  image?: string
}

interface HomeData {
  heroEyebrow: string
  heroTitle: string
  lede: string
  ledeEn: string
  heroImages: string[]
  recentMedia: MediaItem[]
  gallery: GalleryItem[]
  ongoingProjects: ProjectItem[]
}

const { isAdmin } = useAdminMode()
const form = reactive<HomeData>(JSON.parse(JSON.stringify(homeDataRaw)))

function persist() {
  return saveJsonFile('home.json', form)
}

/* ---------------- Hero text ---------------- */

const heroEditing = ref(false)
const heroDraft = reactive({ eyebrow: '', title: '', lede: '', ledeEn: '' })

function startHeroEdit() {
  heroDraft.eyebrow = form.heroEyebrow
  heroDraft.title = form.heroTitle
  heroDraft.lede = form.lede
  heroDraft.ledeEn = form.ledeEn
  heroEditing.value = true
}

function cancelHeroEdit() {
  heroEditing.value = false
}

async function saveHeroEdit() {
  form.heroEyebrow = heroDraft.eyebrow
  form.heroTitle = heroDraft.title
  form.lede = heroDraft.lede
  form.ledeEn = heroDraft.ledeEn
  heroEditing.value = false
  await persist()
}

/* ---------------- Hero images ---------------- */

const heroImageUploading = ref(false)
const heroDrag = useDragReorder(form.heroImages, persist)

async function addHeroImage(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  heroImageUploading.value = true
  const ext = file.name.split('.').pop() || 'jpg'
  const path = await uploadImage('home', `hero-${Date.now()}.${ext}`, file)
  heroImageUploading.value = false

  if (path) {
    form.heroImages.push(path)
    await persist()
  } else {
    alert('Image upload failed. Is the local dev server running?')
  }
}

async function removeHeroImage(i: number) {
  const [removed] = form.heroImages.splice(i, 1)
  if (removed) await deleteImage(removed)
  await persist()
}

/* ---------------- Recent Media ---------------- */

const mediaDrag = useDragReorder(form.recentMedia, persist)

const mediaEditingId = ref<string | null>(null)
const mediaIsNew = ref(false)
const mediaFormError = ref<string | null>(null)
const mediaUploading = ref(false)
const mediaDraft = reactive({ title: '', link: '', image: '' })

function startMediaEdit(item: MediaItem) {
  mediaEditingId.value = item.id
  mediaIsNew.value = false
  mediaFormError.value = null
  mediaDraft.title = item.title
  mediaDraft.link = item.link
  mediaDraft.image = item.image ?? ''
}

function startMediaAdd() {
  mediaEditingId.value = nextSequentialId(form.recentMedia.map((m) => m.id), 'm')
  mediaIsNew.value = true
  mediaFormError.value = null
  mediaDraft.title = ''
  mediaDraft.link = ''
  mediaDraft.image = ''
}

function cancelMediaEdit() {
  mediaEditingId.value = null
  mediaFormError.value = null
}

async function onMediaImageSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !mediaEditingId.value) return

  const oldImage = mediaDraft.image
  mediaUploading.value = true
  const ext = file.name.split('.').pop() || 'jpg'
  const path = await uploadImage('home', `media-${mediaEditingId.value}.${ext}`, file)
  mediaUploading.value = false

  if (path) {
    mediaDraft.image = path
    if (oldImage && !oldImage.startsWith('blob:') && oldImage.split('?')[0] !== path.split('?')[0]) {
      await deleteImage(oldImage)
    }
  } else {
    alert('Image upload failed. Is the local dev server running?')
  }
}

async function removeMediaImage() {
  if (mediaDraft.image) await deleteImage(mediaDraft.image)
  mediaDraft.image = ''
}

async function saveMediaEdit() {
  if (!mediaEditingId.value) return

  const requiredError = checkRequired({ Title: mediaDraft.title })
  if (requiredError) {
    mediaFormError.value = requiredError
    return
  }

  if (mediaIsNew.value) {
    form.recentMedia.push({ id: mediaEditingId.value, title: mediaDraft.title, link: mediaDraft.link, image: mediaDraft.image })
  } else {
    const target = form.recentMedia.find((m) => m.id === mediaEditingId.value)
    if (target) {
      target.title = mediaDraft.title
      target.link = mediaDraft.link
      target.image = mediaDraft.image
    }
  }

  cancelMediaEdit()
  await persist()
}

async function deleteMedia(item: MediaItem) {
  const idx = form.recentMedia.findIndex((m) => m.id === item.id)
  if (idx !== -1) form.recentMedia.splice(idx, 1)
  if (item.image) await deleteImage(item.image)
  await persist()
}

/* ---------------- Gallery ---------------- */

const galleryDrag = useDragReorder(form.gallery, persist)
const galleryUploadingId = ref<string | null>(null)

async function onGalleryImageSelected(id: string, e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  const item = form.gallery.find((g) => g.id === id)
  if (!item) return

  const oldImage = item.image
  galleryUploadingId.value = id
  const ext = file.name.split('.').pop() || 'jpg'
  const path = await uploadImage('home', `gallery-${id}-${Date.now()}.${ext}`, file)
  galleryUploadingId.value = null

  if (path) {
    item.image = path
    if (oldImage) await deleteImage(oldImage)
    await persist()
  } else {
    alert('Image upload failed. Is the local dev server running?')
  }
}

async function addGalleryItem() {
  const id = nextSequentialId(form.gallery.map((g) => g.id), 'gl')
  form.gallery.push({ id, image: '' })
  await persist()
}

async function removeGalleryItem(item: GalleryItem) {
  const idx = form.gallery.findIndex((g) => g.id === item.id)
  if (idx !== -1) form.gallery.splice(idx, 1)
  if (item.image) await deleteImage(item.image)
  await persist()
}

/* ---------------- On-going Projects ---------------- */

const projectsDrag = useDragReorder(form.ongoingProjects, persist)

const projectEditingId = ref<string | null>(null)
const projectIsNew = ref(false)
const projectFormError = ref<string | null>(null)
const projectUploading = ref(false)
const projectDraft = reactive({ title: '', image: '' })

function startProjectEdit(item: ProjectItem) {
  projectEditingId.value = item.id
  projectIsNew.value = false
  projectFormError.value = null
  projectDraft.title = item.title
  projectDraft.image = item.image ?? ''
}

function startProjectAdd() {
  projectEditingId.value = nextSequentialId(form.ongoingProjects.map((p) => p.id), 'p')
  projectIsNew.value = true
  projectFormError.value = null
  projectDraft.title = ''
  projectDraft.image = ''
}

function cancelProjectEdit() {
  projectEditingId.value = null
  projectFormError.value = null
}

async function onProjectImageSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !projectEditingId.value) return

  const oldImage = projectDraft.image
  projectUploading.value = true
  const ext = file.name.split('.').pop() || 'jpg'
  const path = await uploadImage('home', `project-${projectEditingId.value}.${ext}`, file)
  projectUploading.value = false

  if (path) {
    projectDraft.image = path
    if (oldImage && !oldImage.startsWith('blob:') && oldImage.split('?')[0] !== path.split('?')[0]) {
      await deleteImage(oldImage)
    }
  } else {
    alert('Image upload failed. Is the local dev server running?')
  }
}

async function removeProjectImage() {
  if (projectDraft.image) await deleteImage(projectDraft.image)
  projectDraft.image = ''
}

async function saveProjectEdit() {
  if (!projectEditingId.value) return

  const requiredError = checkRequired({ Title: projectDraft.title })
  if (requiredError) {
    projectFormError.value = requiredError
    return
  }

  if (projectIsNew.value) {
    form.ongoingProjects.push({ id: projectEditingId.value, title: projectDraft.title, image: projectDraft.image })
  } else {
    const target = form.ongoingProjects.find((p) => p.id === projectEditingId.value)
    if (target) {
      target.title = projectDraft.title
      target.image = projectDraft.image
    }
  }

  cancelProjectEdit()
  await persist()
}

async function deleteProject(item: ProjectItem) {
  const idx = form.ongoingProjects.findIndex((p) => p.id === item.id)
  if (idx !== -1) form.ongoingProjects.splice(idx, 1)
  if (item.image) await deleteImage(item.image)
  await persist()
}

useEscapeKey(() => {
  if (heroEditing.value) cancelHeroEdit()
  if (mediaEditingId.value) cancelMediaEdit()
  if (projectEditingId.value) cancelProjectEdit()
})

/* ---------------- Ongoing Projects: mobile featured layout ---------------- */

const featuredProject = ref(0)
const otherProjects = computed(() =>
  form.ongoingProjects.map((item, i) => ({ item, i })).filter((entry) => entry.i !== featuredProject.value)
)

async function selectProject(i: number) {
  featuredProject.value = i
  await nextTick()
  const el = document.querySelector('#ongoing .project-main')
  if (!el) return
  // scrollIntoView({block:'start'}) tends to land the image mid-screen once the
  // shorter secondary list below it stops adding scrollable height - pin it near
  // the top (just under the fixed nav) instead, so it reads as "promoted", not centered.
  const targetY = window.scrollY + el.getBoundingClientRect().top - 90
  window.scrollTo({ top: targetY, behavior: 'smooth' })
}

const isMobileOngoing = ref(false)

function updateOngoingLayout() {
  isMobileOngoing.value = window.innerWidth <= 720
}

if (typeof window !== 'undefined') {
  updateOngoingLayout()
  window.addEventListener('resize', updateOngoingLayout)
}

/* ---------------- Gallery slider ---------------- */

// Must match .gallery-track { gap: ... } in HomePage.css - the percentage-based
// translateX alone doesn't account for the gap between slides, so without this
// offset each "next" step falls a few pixels short and drifts further off with
// every click (worst on mobile, where 1 slide = 100% and the gap is the only miss).
const GALLERY_GAP_PX = 12

const galleryVisible = ref(4)
const galleryIndex = ref(0)

const galleryMaxIndex = computed(() => Math.max(0, form.gallery.length - galleryVisible.value))

function updateGalleryVisible() {
  const w = window.innerWidth
  galleryVisible.value = w <= 560 ? 1 : w <= 860 ? 2 : w <= 1100 ? 3 : 4
  galleryIndex.value = Math.min(galleryIndex.value, galleryMaxIndex.value)
}

if (typeof window !== 'undefined') {
  updateGalleryVisible()
  window.addEventListener('resize', updateGalleryVisible)
}

function galleryPrev() {
  galleryIndex.value = Math.max(0, galleryIndex.value - 1)
}

function galleryNext() {
  galleryIndex.value = Math.min(galleryMaxIndex.value, galleryIndex.value + 1)
}

/* ---------------- News (unchanged - edited from the News page) ---------------- */

const fallbackNews: NewsItemType[] = [
  { id: 'seed-1', date: 'Date', desc: 'News content', tag: 'Tag' },
  { id: 'seed-2', date: 'Date', desc: 'News content', tag: 'Tag' },
  { id: 'seed-3', date: 'Date', desc: 'News content', tag: 'Tag' },
]

// 로컬 news.json은 오래된 순으로 저장되어 있고(News 페이지와 동일한 규칙), 날짜 문자열이
// "Mar. 2026"처럼 자유 형식이라 문자열 비교로는 정렬할 수 없습니다 - 그냥 배열을 뒤집어
// 최신순으로 봅니다. 관리자 편집은 News 페이지의 news.json에 반영되므로 홈에서도 같은
// 파일을 읽어 최신 소식이 자동으로 보이게 합니다.
const localLatestNews = [...(newsDataRaw as NewsItemType[])].reverse()

const { news, loading: newsLoading, error: newsError } = useNews(3)
const displayNews = computed(() => {
  if (news.value.length) return news.value.slice(0, 3)
  if (localLatestNews.length) return localLatestNews.slice(0, 3)
  return fallbackNews
})
</script>

<style src="./styles/HomePage.css" scoped></style>
