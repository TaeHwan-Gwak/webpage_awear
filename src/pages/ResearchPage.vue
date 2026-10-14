<template>
  <main class="research-page">
    <PageHeader eyebrow="Research" title="Research" description="" />

    <SignalDivider />

    <div class="research-layout section">
      <aside class="research-nav">
        <span class="nav-label">On this page</span>
        <nav class="topic-nav">
          <a
            v-for="(topic, i) in topics"
            :key="topic.id"
            :href="`#${topic.id}`"
            class="topic-nav-link"
            :class="{ active: activeTopic === topic.id }"
          >
            <span class="num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="label">{{ topic.short }}</span>
          </a>
        </nav>
      </aside>

      <div class="topics">
        <AdminAddButton v-if="isAdmin" label="Add research topic" @add="startTopicAdd" />

        <article v-for="(topic, i) in topics" :id="topic.id" :key="topic.id" class="topic"
          :class="{ dragging: topicsDrag.draggedIndex.value === i }" :draggable="isAdmin" :data-topic="topic.id"
          @dragstart="topicsDrag.onDragStart(i)" @dragover="topicsDrag.onDragOver(i, $event)"
          @drop="topicsDrag.onDrop(i)" @dragend="topicsDrag.onDragEnd">
          <div class="topic-head">
            <DragHandle class="handle" />
            <span class="topic-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <h2>{{ topic.title }}</h2>
            <AdminEditControls v-if="isAdmin" @edit="startTopicEdit(topic)" @delete="deleteTopic(topic)" />
          </div>

          <div class="topic-figure" :class="{ empty: !topic.image || brokenKeys.has(topic.id) }">
            <img v-if="topic.image && !brokenKeys.has(topic.id)" :src="topic.image" alt=""
              :fetchpriority="i === 0 ? 'high' : 'auto'"
              @error="brokenKeys.add(topic.id)" />
            <span v-else class="ph-label">Image</span>

            <template v-if="isAdmin">
              <label class="tile-upload-btn">
                {{ uploadingKey === topic.id ? 'Uploading…' : topic.image ? 'Replace' : '+ Upload' }}
                <input type="file" accept="image/*" @change="onTopicImageSelected(topic.id, $event)" />
              </label>
              <button v-if="topic.image" type="button" class="tile-remove-btn" aria-label="Remove image"
                @click="removeTopicImage(topic.id)">✕</button>
            </template>
          </div>

          <p class="desc">{{ topic.desc }}</p>
        </article>
      </div>
    </div>

    <div v-if="topicEditingId" class="edit-modal-backdrop" @click.self="cancelTopicEdit">
      <div class="edit-modal">
        <label class="field"><span>Title (main heading)</span><textarea v-model="topicDraft.title" rows="3"></textarea></label>
        <label class="field"><span>Short label (sidebar nav)</span><input v-model="topicDraft.short" /></label>
        <label class="field"><span>Description</span><textarea v-model="topicDraft.desc" rows="6"></textarea></label>
        <p v-if="topicFormError" class="form-error">{{ topicFormError }}</p>
        <div class="edit-actions">
          <button type="button" class="save-btn" @click="saveTopicEdit">Save</button>
          <button type="button" class="cancel-btn" @click="cancelTopicEdit">Cancel</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import SignalDivider from '../components/SignalDivider.vue'
import AdminEditControls from '../components/AdminEditControls.vue'
import AdminAddButton from '../components/AdminAddButton.vue'
import DragHandle from '../components/DragHandle.vue'
import { useAdminMode } from '../composables/useAdminMode'
import { useDragReorder } from '../composables/useDragReorder'
import { useEscapeKey } from '../composables/useEscapeKey'
import { saveJsonFile, uploadImage, deleteImage } from '../services/localSave'
import { checkRequired } from '../utils/validate'
import researchDataRaw from '../data/research.json'

interface Topic {
  id: string
  short: string
  title: string
  desc: string
  image: string
}

const { isAdmin } = useAdminMode()

const topics = reactive<Topic[]>(JSON.parse(JSON.stringify(researchDataRaw.topics)))

function persist() {
  return saveJsonFile('research.json', { topics })
}

const topicsDrag = useDragReorder(topics, persist)

function nextTopicId(): string {
  let max = 0
  for (const t of topics) {
    const m = /^topic-(\d+)$/.exec(t.id)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  return `topic-${max + 1}`
}

const topicEditingId = ref<string | null>(null)
const topicIsNew = ref(false)
const topicFormError = ref<string | null>(null)
const topicDraft = reactive({ short: '', title: '', desc: '' })

function startTopicEdit(topic: Topic) {
  topicEditingId.value = topic.id
  topicIsNew.value = false
  topicFormError.value = null
  topicDraft.short = topic.short
  topicDraft.title = topic.title
  topicDraft.desc = topic.desc
}

function startTopicAdd() {
  topicEditingId.value = nextTopicId()
  topicIsNew.value = true
  topicFormError.value = null
  topicDraft.short = ''
  topicDraft.title = ''
  topicDraft.desc = ''
}

function cancelTopicEdit() {
  topicEditingId.value = null
  topicFormError.value = null
}

async function saveTopicEdit() {
  if (!topicEditingId.value) return

  const requiredError = checkRequired({ Title: topicDraft.title, 'Short label': topicDraft.short })
  if (requiredError) {
    topicFormError.value = requiredError
    return
  }

  if (topicIsNew.value) {
    topics.push({
      id: topicEditingId.value,
      short: topicDraft.short,
      title: topicDraft.title,
      desc: topicDraft.desc,
      image: '',
    })
  } else {
    const target = topics.find((t) => t.id === topicEditingId.value)
    if (target) {
      target.short = topicDraft.short
      target.title = topicDraft.title
      target.desc = topicDraft.desc
    }
  }

  cancelTopicEdit()
  await persist()
}

async function deleteTopic(topic: Topic) {
  const idx = topics.findIndex((t) => t.id === topic.id)
  if (idx !== -1) topics.splice(idx, 1)
  if (topic.image) await deleteImage(topic.image)
  await persist()
}

const uploadingKey = ref<string | null>(null)
const brokenKeys = reactive(new Set<string>())

async function onTopicImageSelected(topicId: string, e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  const topic = topics.find((t) => t.id === topicId)
  if (!topic) return

  const oldImage = topic.image
  uploadingKey.value = topicId
  const ext = file.name.split('.').pop() || 'jpg'
  const path = await uploadImage('research', `${topicId}-${Date.now()}.${ext}`, file)
  uploadingKey.value = null

  if (path) {
    topic.image = path
    brokenKeys.delete(topicId)
    if (oldImage) await deleteImage(oldImage)
    await persist()
  } else {
    alert('Image upload failed. Is the local dev server running?')
  }
}

async function removeTopicImage(topicId: string) {
  const topic = topics.find((t) => t.id === topicId)
  if (!topic) return
  if (topic.image) await deleteImage(topic.image)
  topic.image = ''
  await persist()
}

useEscapeKey(() => {
  if (topicEditingId.value) cancelTopicEdit()
})

const activeTopic = ref(topics[0]?.id ?? '')
const intersecting = new Set<string>()
let observer: IntersectionObserver | undefined

function onScroll() {
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
  if (atBottom && topics.length) activeTopic.value = topics[topics.length - 1].id
}

onMounted(() => {
  const els = document.querySelectorAll<HTMLElement>('[data-topic]')
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.topic
        if (!id) continue
        if (entry.isIntersecting) intersecting.add(id)
        else intersecting.delete(id)
      }
      const firstVisible = topics.find((t) => intersecting.has(t.id))
      if (firstVisible) activeTopic.value = firstVisible.id
    },
    { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
  )
  els.forEach((el) => observer?.observe(el))
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  observer?.disconnect()
  window.removeEventListener('scroll', onScroll)
})
</script>

<style src="./styles/ResearchPage.css" scoped></style>
