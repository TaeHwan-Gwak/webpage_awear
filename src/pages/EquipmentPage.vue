<template>
  <main class="equipment-page">
    <PageHeader eyebrow="Equipment" title="Equipment" description="" />

    <SignalDivider />

    <section class="equipment-grid section">
      <AdminAddButton v-if="isAdmin" label="Add equipment" @add="startAdd" />

      <div class="grid">
        <div v-for="(item, i) in equipment" :key="item.id" class="equipment-slot"
          :class="{ dragging: equipmentDrag.draggedIndex.value === i }" :draggable="isAdmin"
          @dragstart="equipmentDrag.onDragStart(i)" @dragover="equipmentDrag.onDragOver(i, $event)"
          @drop="equipmentDrag.onDrop(i)" @dragend="equipmentDrag.onDragEnd">
          <DragHandle class="handle" />
          <figure class="equipment-card">
            <div class="thumb">
              <LayeredImage v-if="item.layers?.length" :layers="item.layers" :alt="item.name" />
              <img v-else-if="item.image && !brokenIds.has(item.id)" :src="item.image" :alt="item.name" loading="lazy"
                @error="brokenIds.add(item.id)" />
              <span v-else class="ph-label">Image</span>
            </div>
            <figcaption class="name">{{ item.name }}</figcaption>
          </figure>
          <AdminEditControls v-if="isAdmin" @edit="startEdit(item)" @delete="deleteEquipment(item)" />
        </div>
      </div>
    </section>

    <div v-if="editingId" class="edit-modal-backdrop" @click.self="cancelEdit">
      <div class="edit-modal">
        <label class="field"><span>Name</span><input v-model="draft.name" /></label>
        <div class="field">
          <span>Image</span>
          <div v-if="draft.layers.length" class="photo-preview">
            <LayeredImage :layers="draft.layers" />
            <button type="button" class="remove-image-btn" aria-label="Remove all images" @click="removeAllImages">✕</button>
          </div>
          <label class="upload-btn" @click.prevent="composerOpen = true">
            {{ draft.layers.length ? 'Edit images' : '+ Upload image' }}
          </label>
        </div>
        <p v-if="formError" class="form-error">{{ formError }}</p>
        <div class="edit-actions">
          <button type="button" class="save-btn" @click="saveEdit">Save</button>
          <button type="button" class="cancel-btn" @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </div>

    <ImageComposer :open="composerOpen" :initial-layers="draft.layers" :aspect-ratio="4 / 3" @use="onComposedLayers"
      @cancel="composerOpen = false" />
  </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import SignalDivider from '../components/SignalDivider.vue'
import AdminEditControls from '../components/AdminEditControls.vue'
import AdminAddButton from '../components/AdminAddButton.vue'
import DragHandle from '../components/DragHandle.vue'
import ImageComposer, { type LayerResult } from '../components/ImageComposer.vue'
import LayeredImage, { type ImageLayer } from '../components/LayeredImage.vue'
import { useAdminMode } from '../composables/useAdminMode'
import { useDragReorder } from '../composables/useDragReorder'
import { useEscapeKey } from '../composables/useEscapeKey'
import { saveJsonFile, uploadImage, deleteImage } from '../services/localSave'
import { nextSequentialId } from '../utils/nextId'
import { checkRequired } from '../utils/validate'
import equipmentDataRaw from '../data/equipment.json'

interface Equipment {
  id: string
  name: string
  image?: string
  layers?: ImageLayer[]
}

const { isAdmin } = useAdminMode()

const equipment = reactive<Equipment[]>(JSON.parse(JSON.stringify(equipmentDataRaw)))
const brokenIds = reactive(new Set<string>())
const equipmentDrag = useDragReorder(equipment, () => saveJsonFile('equipment.json', equipment))

const editingId = ref<string | null>(null)
const isNewEquipment = ref(false)
const formError = ref<string | null>(null)
const draft = reactive<{ name: string; layers: ImageLayer[] }>({ name: '', layers: [] })

function startEdit(item: Equipment) {
  editingId.value = item.id
  isNewEquipment.value = false
  formError.value = null
  draft.name = item.name
  // 예전 방식(사진 1장 합성본)으로 저장된 항목은 그걸 layer 1개짜리로 취급해서 편집기에 그대로 띄웁니다.
  draft.layers = item.layers?.length
    ? [...item.layers]
    : item.image
      ? [{ src: item.image, x: 0, y: 0, width: 1, height: 1 }]
      : []
}

function startAdd() {
  // 이미지 업로드 시 id 기준 파일명이 필요해서, 저장 전에 미리 id를 만들어둡니다.
  editingId.value = nextSequentialId(equipment.map((e) => e.id), 'eq')
  isNewEquipment.value = true
  formError.value = null
  draft.name = ''
  draft.layers = []
}

function cancelEdit() {
  editingId.value = null
  formError.value = null
}

const composerOpen = ref(false)

async function removeAllImages() {
  for (const layer of draft.layers) await deleteImage(layer.src)
  draft.layers = []
}

async function onComposedLayers(results: LayerResult[], removedSrcs: string[]) {
  composerOpen.value = false
  if (!editingId.value) return

  const newLayers: ImageLayer[] = []

  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    if (r.src) {
      newLayers.push({ src: r.src, x: r.x, y: r.y, width: r.width, height: r.height })
    } else if (r.blob && r.ext) {
      const path = await uploadImage('equipment', `${editingId.value}-${i}.${r.ext}`, r.blob)
      if (!path) {
        alert('Image upload failed. Is the local dev server running?')
        return
      }
      newLayers.push({ src: path, x: r.x, y: r.y, width: r.width, height: r.height })
    }
  }

  for (const src of removedSrcs) {
    await deleteImage(src)
  }

  draft.layers = newLayers
}

async function saveEdit() {
  if (!editingId.value) return

  const requiredError = checkRequired({ Name: draft.name })
  if (requiredError) {
    formError.value = requiredError
    return
  }

  if (isNewEquipment.value) {
    equipment.push({ id: editingId.value, name: draft.name, layers: draft.layers })
  } else {
    const target = equipment.find((e) => e.id === editingId.value)
    if (target) {
      target.name = draft.name
      target.layers = draft.layers
      target.image = undefined // 레이어 방식으로 넘어갔으니 예전 단일 이미지 필드는 비웁니다.
    }
  }

  cancelEdit()
  await saveJsonFile('equipment.json', equipment)
}

async function deleteEquipment(item: Equipment) {
  const idx = equipment.findIndex((e) => e.id === item.id)
  if (idx !== -1) equipment.splice(idx, 1)
  for (const layer of item.layers ?? []) await deleteImage(layer.src)
  if (item.image) await deleteImage(item.image)
  await saveJsonFile('equipment.json', equipment)
}

useEscapeKey(() => {
  if (editingId.value) cancelEdit()
})
</script>

<style src="./styles/EquipmentPage.css" scoped></style>
