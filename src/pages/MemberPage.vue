<template>
  <main class="member-page">
    <PageHeader eyebrow="Member" title="Page title" description="Page description" />

    <SignalDivider />

    <section class="pi-feature section">
      <div class="card">
        <div class="portrait" aria-hidden="true">
          <span class="ph-label">Image</span>
        </div>
        <div v-if="editingPI" class="body edit-form">
          <label class="field"><span>Name</span><input v-model="piDraft.name" /></label>
          <label class="field"><span>Role</span><input v-model="piDraft.role" /></label>
          <label class="field"><span>Email</span><input v-model="piDraft.email" /></label>
          <div class="edit-actions">
            <button type="button" class="save-btn" @click="savePI">Save</button>
            <button type="button" class="cancel-btn" @click="editingPI = false">Cancel</button>
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
            :interests="member.interests" />
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
            :interests="member.interests" />
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
import { saveJsonFile } from '../services/localSave'
import membersDataRaw from '../data/members.json'

interface Member {
  id: string
  name: string
  role: string
  note?: string
  email?: string
  interests?: string
}

const { isAdmin } = useAdminMode()

const form = reactive(JSON.parse(JSON.stringify(membersDataRaw)) as typeof membersDataRaw)

type GroupKey = 'postdocs' | 'members' | 'alumni'

const editingGroup = ref<GroupKey | null>(null)
const editingId = ref<string | 'new' | null>(null)
const draft = reactive({ name: '', role: '', note: '', email: '', interests: '' })

function startEdit(group: GroupKey, member: Member) {
  editingGroup.value = group
  editingId.value = member.id
  draft.name = member.name
  draft.role = member.role
  draft.note = member.note ?? ''
  draft.email = member.email ?? ''
  draft.interests = member.interests ?? ''
}

function startAdd(group: GroupKey) {
  editingGroup.value = group
  editingId.value = 'new'
  draft.name = ''
  draft.role = ''
  draft.note = ''
  draft.email = ''
  draft.interests = ''
}

function cancelEdit() {
  editingGroup.value = null
  editingId.value = null
}

async function saveMember() {
  if (!editingGroup.value) return
  const list = form[editingGroup.value] as Member[]

  if (editingId.value === 'new') {
    const id = editingGroup.value[0] + Date.now()
    list.push({ id, name: draft.name, role: draft.role, note: draft.note, email: draft.email, interests: draft.interests })
  } else {
    const target = list.find((m) => m.id === editingId.value)
    if (target) {
      target.name = draft.name
      target.role = draft.role
      target.note = draft.note
      target.email = draft.email
      target.interests = draft.interests
    }
  }

  cancelEdit()
  await saveJsonFile('members.json', form)
}

async function deleteMember(group: GroupKey, member: Member) {
  const list = form[group] as Member[]
  const idx = list.findIndex((m) => m.id === member.id)
  if (idx !== -1) list.splice(idx, 1)
  await saveJsonFile('members.json', form)
}

const editingPI = ref(false)
const piDraft = reactive({ name: '', role: '', email: '' })

function startEditPI() {
  piDraft.name = form.pi.name
  piDraft.role = form.pi.role
  piDraft.email = form.pi.email
  editingPI.value = true
}

async function savePI() {
  form.pi.name = piDraft.name
  form.pi.role = piDraft.role
  form.pi.email = piDraft.email
  editingPI.value = false
  await saveJsonFile('members.json', form)
}
</script>

<style src="./styles/MemberPage.css" scoped></style>
