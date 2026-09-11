<template>
  <main class="member-page">
    <PageHeader eyebrow="Member" title="Page title" description="Page description" />

    <SignalDivider />

    <section class="pi-feature section">
      <div class="card">
        <div class="portrait" aria-hidden="true">
          <img v-if="!editingPI && form.pi.photo" :src="form.pi.photo" alt="" class="portrait-photo" />
          <span v-else-if="!editingPI" class="ph-label">Image</span>
        </div>
        <div v-if="editingPI" class="body edit-form">
          <label class="field"><span>Name</span><input v-model="piDraft.name" /></label>
          <label class="field"><span>Role</span><input v-model="piDraft.role" /></label>
          <label class="field"><span>Email</span><input v-model="piDraft.email" /></label>
          <div class="field">
            <span>Photo</span>
            <div v-if="piDraft.photo" class="photo-preview">
              <img :src="piDraft.photo" alt="" />
              <button type="button" class="remove-image-btn" aria-label="Remove photo" @click="removePIPhoto">✕</button>
            </div>
            <label class="upload-btn">
              {{ uploadingPIPhoto ? 'Uploading…' : '+ Upload photo' }}
              <input type="file" accept="image/*" :disabled="uploadingPIPhoto" @change="onPIPhotoSelected" />
            </label>
          </div>
          <p v-if="piFormError" class="form-error">{{ piFormError }}</p>
          <div class="edit-actions">
            <button type="button" class="save-btn" @click="savePI">Save</button>
            <button type="button" class="cancel-btn" @click="cancelEditPI">Cancel</button>
          </div>
        </div>
        <div v-else class="body">
          <p class="eyebrow">Principal Investigator</p>
          <h2>{{ form.pi.name }}</h2>
          <p class="role">{{ form.pi.role }}</p>
          <div class="actions">
            <a class="mail" :href="`mailto:${form.pi.email}`">{{ form.pi.email }}</a>
            <router-link class="cv-btn" to="/member/cv">View CV →</router-link>
            <AdminEditControls v-if="isAdmin" hide-delete @edit="startEditPI" />
          </div>
        </div>
      </div>
    </section>

    <section v-if="form.postdocs?.length || isAdmin" class="group section">
      <h2 class="group-title">Postdoctoral Researchers</h2>
      <div class="grid">
        <div v-for="member in form.postdocs" :key="member.id" class="card-slot">
          <MemberCard :name="member.name" :role="member.role" :note="member.note" :email="member.email"
            :interests="member.interests" :photo="member.photo" />
          <AdminEditControls v-if="isAdmin" @edit="startEdit('postdocs', member)" @delete="deleteMember('postdocs', member)" />
        </div>
      </div>
      <AdminAddButton v-if="isAdmin" label="Add postdoc" @add="startAdd('postdocs')" />
    </section>

    <section class="group section">
      <h2 class="group-title">{{ form.groupTitle }}</h2>
      <div class="grid">
        <div v-for="member in form.members" :key="member.id" class="card-slot">
          <MemberCard :name="member.name" :role="member.role" :note="member.note" :email="member.email"
            :interests="member.interests" :photo="member.photo" />
          <AdminEditControls v-if="isAdmin" @edit="startEdit('members', member)" @delete="deleteMember('members', member)" />
        </div>
      </div>
      <AdminAddButton v-if="isAdmin" label="Add member" @add="startAdd('members')" />
    </section>

    <section v-if="form.alumni?.length || isAdmin" class="group alumni section">
      <h2 class="group-title">{{ form.alumniTitle ?? 'Alumni' }}</h2>
      <ul class="alumni-list">
        <li v-for="member in form.alumni" :key="member.id" class="alumni-row">
          <AlumniItem :name="member.name" :role="member.role" :note="member.note" />
          <AdminEditControls v-if="isAdmin" @edit="startEdit('alumni', member)" @delete="deleteMember('alumni', member)" />
        </li>
      </ul>
      <AdminAddButton v-if="isAdmin" label="Add alumnus" @add="startAdd('alumni')" />
    </section>

    <div v-if="editingGroup" class="edit-modal-backdrop" @click.self="cancelEdit">
      <div class="edit-modal">
        <label class="field"><span>Name</span><input v-model="draft.name" /></label>
        <label class="field"><span>Role</span><input v-model="draft.role" /></label>
        <label class="field"><span>Note</span><input v-model="draft.note" /></label>
        <label v-if="editingGroup !== 'alumni'" class="field"><span>Email</span><input v-model="draft.email" /></label>
        <label v-if="editingGroup !== 'alumni'" class="field"><span>Interests</span><input v-model="draft.interests" /></label>
        <div v-if="editingGroup !== 'alumni'" class="field">
          <span>Photo</span>
          <div v-if="draft.photo" class="photo-preview">
            <img :src="draft.photo" alt="" />
            <button type="button" class="remove-image-btn" aria-label="Remove photo" @click="removeMemberPhoto">✕</button>
          </div>
          <label class="upload-btn">
            {{ uploadingPhoto ? 'Uploading…' : '+ Upload photo' }}
            <input type="file" accept="image/*" :disabled="uploadingPhoto" @change="onMemberPhotoSelected" />
          </label>
        </div>
        <p v-if="formError" class="form-error">{{ formError }}</p>
        <div class="edit-actions">
          <button type="button" class="save-btn" @click="saveMember">Save</button>
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
import MemberCard from '../components/MemberCard.vue'
import AlumniItem from '../components/AlumniItem.vue'
import AdminEditControls from '../components/AdminEditControls.vue'
import AdminAddButton from '../components/AdminAddButton.vue'
import { useAdminMode } from '../composables/useAdminMode'
import { saveJsonFile, uploadImage, deleteImage } from '../services/localSave'
import { nextSequentialId } from '../utils/nextId'
import { checkRequired, isValidEmail } from '../utils/validate'
import membersDataRaw from '../data/members.json'

interface Member {
  id: string
  name: string
  role: string
  note?: string
  email?: string
  interests?: string
  photo?: string
}

const { isAdmin } = useAdminMode()

const form = reactive(JSON.parse(JSON.stringify(membersDataRaw)) as typeof membersDataRaw)

type GroupKey = 'postdocs' | 'members' | 'alumni'

const FALLBACK_PREFIX: Record<GroupKey, string> = {
  postdocs: 'p',
  members: 'g',
  alumni: 'a',
}

const editingGroup = ref<GroupKey | null>(null)
const editingId = ref<string | null>(null)
const isNewMember = ref(false)
const uploadingPhoto = ref(false)
const formError = ref<string | null>(null)
const draft = reactive({ name: '', role: '', note: '', email: '', interests: '', photo: '' })

function startEdit(group: GroupKey, member: Member) {
  editingGroup.value = group
  editingId.value = member.id
  isNewMember.value = false
  formError.value = null
  draft.name = member.name
  draft.role = member.role
  draft.note = member.note ?? ''
  draft.email = member.email ?? ''
  draft.interests = member.interests ?? ''
  draft.photo = member.photo ?? ''
}

function startAdd(group: GroupKey) {
  const list = form[group] as Member[]
  editingGroup.value = group
  // 사진 업로드 시 id 기준 파일명이 필요해서, 저장 전에 미리 id를 만들어둡니다.
  editingId.value = nextSequentialId(list.map((m) => m.id), FALLBACK_PREFIX[group])
  isNewMember.value = true
  formError.value = null
  draft.name = ''
  draft.role = ''
  draft.note = ''
  draft.email = ''
  draft.interests = ''
  draft.photo = ''
}

function cancelEdit() {
  editingGroup.value = null
  editingId.value = null
  formError.value = null
}

async function onMemberPhotoSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !editingId.value) return

  uploadingPhoto.value = true
  const ext = file.name.split('.').pop() || 'jpg'
  const path = await uploadImage('member', `${editingId.value}.${ext}`, file)
  uploadingPhoto.value = false

  if (path) draft.photo = path
  else alert('Photo upload failed. Is the local dev server running?')
}

async function removeMemberPhoto() {
  if (draft.photo) await deleteImage(draft.photo)
  draft.photo = ''
}

async function saveMember() {
  if (!editingGroup.value || !editingId.value) return

  const requiredError = checkRequired({ Name: draft.name, Role: draft.role })
  if (requiredError) {
    formError.value = requiredError
    return
  }
  if (editingGroup.value !== 'alumni' && draft.email && !isValidEmail(draft.email)) {
    formError.value = 'Please enter a valid email address.'
    return
  }

  const list = form[editingGroup.value] as Member[]

  if (isNewMember.value) {
    list.push({
      id: editingId.value,
      name: draft.name,
      role: draft.role,
      note: draft.note,
      email: draft.email,
      interests: draft.interests,
      photo: draft.photo,
    })
  } else {
    const target = list.find((m) => m.id === editingId.value)
    if (target) {
      target.name = draft.name
      target.role = draft.role
      target.note = draft.note
      target.email = draft.email
      target.interests = draft.interests
      target.photo = draft.photo
    }
  }

  cancelEdit()
  await saveJsonFile('members.json', form)
}

async function deleteMember(group: GroupKey, member: Member) {
  const list = form[group] as Member[]
  const idx = list.findIndex((m) => m.id === member.id)
  if (idx !== -1) list.splice(idx, 1)
  if (member.photo) await deleteImage(member.photo)
  await saveJsonFile('members.json', form)
}

const editingPI = ref(false)
const uploadingPIPhoto = ref(false)
const piFormError = ref<string | null>(null)
const piDraft = reactive({ name: '', role: '', email: '', photo: '' })

function startEditPI() {
  piDraft.name = form.pi.name
  piDraft.role = form.pi.role
  piDraft.email = form.pi.email
  piDraft.photo = form.pi.photo ?? ''
  piFormError.value = null
  editingPI.value = true
}

function cancelEditPI() {
  editingPI.value = false
  piFormError.value = null
}

async function onPIPhotoSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  uploadingPIPhoto.value = true
  const ext = file.name.split('.').pop() || 'jpg'
  const path = await uploadImage('member', `pi.${ext}`, file)
  uploadingPIPhoto.value = false

  if (path) piDraft.photo = path
  else alert('Photo upload failed. Is the local dev server running?')
}

async function removePIPhoto() {
  if (piDraft.photo) await deleteImage(piDraft.photo)
  piDraft.photo = ''
}

async function savePI() {
  const requiredError = checkRequired({ Name: piDraft.name, Role: piDraft.role, Email: piDraft.email })
  if (requiredError) {
    piFormError.value = requiredError
    return
  }
  if (!isValidEmail(piDraft.email)) {
    piFormError.value = 'Please enter a valid email address.'
    return
  }

  form.pi.name = piDraft.name
  form.pi.role = piDraft.role
  form.pi.email = piDraft.email
  form.pi.photo = piDraft.photo
  editingPI.value = false
  await saveJsonFile('members.json', form)
}
</script>

<style src="./styles/MemberPage.css" scoped></style>
