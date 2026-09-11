<template>
  <main class="equipment-page">
    <PageHeader eyebrow="Equipment" title="Equipment" description="" />

    <SignalDivider />

    <section class="equipment-grid section">
      <AdminAddButton v-if="isAdmin" label="Add equipment" @add="startAdd" />

      <div class="grid">
        <div v-for="item in equipment" :key="item.id" class="equipment-slot">
          <figure class="equipment-card">
            <div class="thumb">
              <img v-if="item.image && !brokenIds.has(item.id)" :src="item.image" :alt="item.name" loading="lazy"
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
          <div v-if="draft.image" class="photo-preview">
            <img :src="draft.image" alt="" />
            <button type="button" class="remove-image-btn" aria-label="Remove image" @click="removeImage">✕</button>
          </div>
          <label class="upload-btn">
            {{ uploading ? 'Uploading…' : '+ Upload image' }}
            <input type="file" accept="image/*" :disabled="uploading" @change="onImageSelected" />
          </label>
        </div>
        <div class="edit-actions">
          <button type="button" class="save-btn" @click="saveEdit">Save</button>
          <button type="button" class="cancel-btn" @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import SignalDivider from '../components/SignalDivider.vue'
import AdminEditControls from '../components/AdminEditControls.vue'
import AdminAddButton from '../components/AdminAddButton.vue'
import { useAdminMode } from '../composables/useAdminMode'
import { saveJsonFile, uploadImage, deleteImage } from '../services/localSave'
import { nextSequentialId } from '../utils/nextId'
import equipmentDataRaw from '../data/equipment.json'

interface Equipment {
  id: string
  name: string
  image?: string
}

const { isAdmin } = useAdminMode()

const equipment = reactive<Equipment[]>(JSON.parse(JSON.stringify(equipmentDataRaw)))
const brokenIds = reactive(new Set<string>())

const editingId = ref<string | null>(null)
const isNewEquipment = ref(false)
const uploading = ref(false)
const draft = reactive({ name: '', image: '' })

function startEdit(item: Equipment) {
  editingId.value = item.id
  isNewEquipment.value = false
  draft.name = item.name
  draft.image = item.image ?? ''
}

function startAdd() {
  // 이미지 업로드 시 id 기준 파일명이 필요해서, 저장 전에 미리 id를 만들어둡니다.
  editingId.value = nextSequentialId(equipment.map((e) => e.id), 'eq')
  isNewEquipment.value = true
  draft.name = ''
  draft.image = ''
}

function cancelEdit() {
  editingId.value = null
}

async function onImageSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !editingId.value) return

  uploading.value = true
  const ext = file.name.split('.').pop() || 'jpg'
  const path = await uploadImage('equipment', `${editingId.value}.${ext}`, file)
  uploading.value = false

  if (path) draft.image = path
  else alert('Image upload failed. Is the local dev server running?')
}

async function removeImage() {
  if (draft.image) await deleteImage(draft.image)
  draft.image = ''
}

async function saveEdit() {
  if (!editingId.value) return

  if (isNewEquipment.value) {
    equipment.push({ id: editingId.value, name: draft.name, image: draft.image })
  } else {
    const target = equipment.find((e) => e.id === editingId.value)
    if (target) {
      target.name = draft.name
      target.image = draft.image
    }
  }

  cancelEdit()
  await saveJsonFile('equipment.json', equipment)
}

async function deleteEquipment(item: Equipment) {
  const idx = equipment.findIndex((e) => e.id === item.id)
  if (idx !== -1) equipment.splice(idx, 1)
  if (item.image) await deleteImage(item.image)
  await saveJsonFile('equipment.json', equipment)
}
</script>

<style src="./styles/EquipmentPage.css" scoped></style>
