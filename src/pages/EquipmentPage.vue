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
            <button type="button" class="edit-image-btn" aria-label="Edit image" @click="editExistingImage">✎</button>
            <button type="button" class="remove-image-btn" aria-label="Remove image" @click="removeImage">✕</button>
          </div>
          <label class="upload-btn">
            + Upload image
            <input type="file" accept="image/*" @change="onImageSelected" />
          </label>
        </div>
        <p v-if="formError" class="form-error">{{ formError }}</p>
        <div class="edit-actions">
          <button type="button" class="save-btn" @click="saveEdit">Save</button>
          <button type="button" class="cancel-btn" @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </div>

    <ImageComposer :open="composerOpen" :initial-file="composerFile" :initial-url="composerUrl" :aspect-ratio="4 / 3"
      @use="onComposedImage" @cancel="composerOpen = false" />

    <UnsavedChangesBar :dirty="pending.isDirty.value" :saving="pending.isSaving.value" @save="pending.save"
      @cancel="cancelChanges" />
    <LeaveConfirmModal :open="leaveGuard.showLeaveModal.value" @save-and-leave="leaveGuard.saveAndLeave"
      @discard-and-leave="leaveGuard.discardAndLeave" @stay="leaveGuard.stay" />
  </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import SignalDivider from '../components/SignalDivider.vue'
import AdminEditControls from '../components/AdminEditControls.vue'
import AdminAddButton from '../components/AdminAddButton.vue'
import DragHandle from '../components/DragHandle.vue'
import ImageComposer from '../components/ImageComposer.vue'
import UnsavedChangesBar from '../components/UnsavedChangesBar.vue'
import LeaveConfirmModal from '../components/LeaveConfirmModal.vue'
import { useAdminMode } from '../composables/useAdminMode'
import { useDragReorder } from '../composables/useDragReorder'
import { useEscapeKey } from '../composables/useEscapeKey'
import { usePendingChanges } from '../composables/usePendingChanges'
import { usePendingUploads } from '../composables/usePendingUploads'
import { useLeaveGuard } from '../composables/useLeaveGuard'
import { saveJsonFile } from '../services/localSave'
import { nextSequentialId } from '../utils/nextId'
import { checkRequired } from '../utils/validate'
import equipmentDataRaw from '../data/equipment.json'

interface Equipment {
  id: string
  name: string
  image?: string
}

const { isAdmin } = useAdminMode()

const equipment = reactive<Equipment[]>(JSON.parse(JSON.stringify(equipmentDataRaw)))
const brokenIds = reactive(new Set<string>())
const equipmentDrag = useDragReorder(equipment, () => {})

const pendingUploads = usePendingUploads()

const pending = usePendingChanges(() => equipment, async (state) => {
  // 실제 파일 업로드/삭제는 지금(페이지 Save 시점)까지 미뤄뒀던 것들입니다 - 그래야
  // Cancel을 누르면 사진 변경도 전부 없었던 일이 됩니다.
  const resolved = await pendingUploads.flush()
  for (const item of state) {
    if (item.image && resolved.has(item.image)) item.image = resolved.get(item.image)!
  }
  return saveJsonFile('equipment.json', state)
})

function cancelChanges() {
  pendingUploads.discard()
  const restored = pending.cancel()
  equipment.splice(0, equipment.length, ...restored)
}

const leaveGuard = useLeaveGuard(
  () => pending.isDirty.value,
  () => pending.save(),
  () => cancelChanges()
)

const editingId = ref<string | null>(null)
const isNewEquipment = ref(false)
const formError = ref<string | null>(null)
const draft = reactive({ name: '', image: '' })

function startEdit(item: Equipment) {
  editingId.value = item.id
  isNewEquipment.value = false
  formError.value = null
  draft.name = item.name
  draft.image = item.image ?? ''
}

function startAdd() {
  // 이미지 업로드 시 id 기준 파일명이 필요해서, 저장 전에 미리 id를 만들어둡니다.
  editingId.value = nextSequentialId(equipment.map((e) => e.id), 'eq')
  isNewEquipment.value = true
  formError.value = null
  draft.name = ''
  draft.image = ''
}

function cancelEdit() {
  editingId.value = null
  formError.value = null
}

const composerOpen = ref(false)
const composerFile = ref<File | null>(null)
const composerUrl = ref<string | null>(null)

function onImageSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  composerFile.value = file
  composerUrl.value = null
  composerOpen.value = true
}

function editExistingImage() {
  composerFile.value = null
  composerUrl.value = draft.image
  composerOpen.value = true
}

function onComposedImage(blob: Blob) {
  composerOpen.value = false
  if (!editingId.value) return

  // 아직 저장 전(blob:)인 이전 편집만 정리합니다. 이미 저장된 실제 경로는
  // 같은 파일명으로 그대로 덮어쓸 거라 삭제 큐에 넣으면 안 됩니다(방금 올린
  // 파일을 flush 단계에서 다시 지워버리게 됨).
  if (draft.image?.startsWith('blob:')) pendingUploads.queueDelete(draft.image)
  draft.image = pendingUploads.queueUpload('equipment', `${editingId.value}.jpg`, blob)
}

function removeImage() {
  pendingUploads.queueDelete(draft.image)
  draft.image = ''
}

async function saveEdit() {
  if (!editingId.value) return

  const requiredError = checkRequired({ Name: draft.name })
  if (requiredError) {
    formError.value = requiredError
    return
  }

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
}

function deleteEquipment(item: Equipment) {
  const idx = equipment.findIndex((e) => e.id === item.id)
  if (idx !== -1) equipment.splice(idx, 1)
  pendingUploads.queueDelete(item.image)
}

useEscapeKey(() => {
  if (leaveGuard.showLeaveModal.value) leaveGuard.stay()
  else if (editingId.value) cancelEdit()
})
</script>

<style src="./styles/EquipmentPage.css" scoped></style>
