<template>
  <div class="admin-members">
    <p class="eyebrow">Admin</p>
    <h1>Member Management</h1>

    <div class="layout">
      <aside class="member-panel">
        <ul class="member-list">
          <li class="member-row" :class="{ active: mode === 'pi' }" @click="selectPI">
            <span class="pi-tag">PI</span>
            <span class="name">{{ form.pi.name }}</span>
          </li>

          <li v-for="m in form.members" :key="m.id" class="member-row"
            :class="{ active: mode === 'member' && selectedId === m.id }" @click="selectMember(m.id)">
            <span class="name">{{ m.name }}</span>
          </li>
        </ul>

        <button type="button" class="add-btn" :disabled="!canEditAdmin" @click="startAdd">+ Add</button>
      </aside>

      <section class="detail-panel">
        <p v-if="mode === null" class="empty-hint">Select a member on the left, or click [+ Add] to register a new one.</p>

        <form v-else class="detail-form" @submit.prevent="onSave">
          <template v-if="mode === 'pi'">
            <label class="field">
              <span>Name</span>
              <input v-model="form.pi.name" type="text" placeholder="Enter a name" />
            </label>
            <label class="field">
              <span>Affiliation / Title</span>
              <input v-model="form.pi.role" type="text" placeholder="e.g. Professor, GIST Dept. of AI" />
            </label>
            <label class="field">
              <span>Bio</span>
              <textarea v-model="form.pi.bio" rows="4" placeholder="Enter a bio"></textarea>
            </label>
            <label class="field">
              <span>Email</span>
              <input v-model="form.pi.email" type="text" placeholder="example@gist.ac.kr" />
            </label>
          </template>

          <template v-else-if="mode === 'member' && activeMember">
            <label class="field">
              <span>Name</span>
              <input v-model="activeMember.name" type="text" placeholder="Enter a name" />
            </label>
            <label class="field">
              <span>Role</span>
              <input v-model="activeMember.role" type="text" placeholder="e.g. M.S. Student" />
            </label>
            <label class="field">
              <span>Note</span>
              <input v-model="activeMember.note" type="text" placeholder="Optional" />
            </label>
          </template>

          <template v-else-if="mode === 'new'">
            <label class="field">
              <span>Name</span>
              <input v-model="draft.name" type="text" placeholder="Enter a name" />
            </label>
            <label class="field">
              <span>Role</span>
              <input v-model="draft.role" type="text" placeholder="e.g. M.S. Student" />
            </label>
            <label class="field">
              <span>Note</span>
              <input v-model="draft.note" type="text" placeholder="Optional" />
            </label>
          </template>

          <div class="actions">
            <button type="submit" class="btn save" :disabled="!canEditAdmin">Save</button>
            <button
              v-if="mode === 'member'"
              type="button"
              class="btn delete"
              :disabled="!canEditAdmin"
              @click="onDelete"
            >
              Delete
            </button>
          </div>

          <p v-if="status === 'ok'" class="status ok">Saved. (Stored temporarily in this browser only)</p>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import membersData from '../../data/members.json'
import { canEditAdmin, requireAdminSession } from '../../composables/useAdminAuth'

interface Member {
  id: string
  name: string
  role: string
  note: string
}

interface MembersForm {
  pi: { name: string; role: string; bio: string; email: string }
  groupTitle: string
  members: Member[]
}

const router = useRouter()

const STORAGE_KEY = 'awear-admin-members-draft'

function loadInitial(): MembersForm {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      return JSON.parse(saved) as MembersForm
    } catch {
      // Fall back to the original JSON if the saved value is corrupted
    }
  }
  return {
    pi: { ...membersData.pi },
    groupTitle: membersData.groupTitle,
    members: membersData.members.map((m): Member => ({ ...m })),
  }
}

const form = reactive<MembersForm>(loadInitial())

type Mode = null | 'pi' | 'member' | 'new'
const mode = ref<Mode>(null)
const selectedId = ref<string | null>(null)
const status = ref<'idle' | 'ok'>('idle')

const draft = reactive({ name: '', role: '', note: '' })

const activeMember = computed(() => {
  if (mode.value !== 'member') return null
  return form.members.find((m) => m.id === selectedId.value) ?? null
})

function selectPI() {
  mode.value = 'pi'
  selectedId.value = null
  status.value = 'idle'
}

function selectMember(id: string) {
  mode.value = 'member'
  selectedId.value = id
  status.value = 'idle'
}

function startAdd() {
  if (!guardSession()) return
  mode.value = 'new'
  selectedId.value = null
  draft.name = ''
  draft.role = ''
  draft.note = ''
  status.value = 'idle'
}

/**
 * Gate that every edit, add and delete goes through.
 * When the session is gone it sends you back to login with the reason attached.
 */
function guardSession(): boolean {
  const check = requireAdminSession()
  if (check === 'ok') return true

  router.replace({
    path: '/admin/login',
    query: { redirect: router.currentRoute.value.fullPath, reason: check },
  })
  return false
}

function onSave() {
  if (!guardSession()) return

  if (mode.value === 'new') {
    const id = 'm' + Date.now()
    form.members.push({ id, name: draft.name, role: draft.role, note: draft.note })
    selectMember(id)
  }
  persist()
  status.value = 'ok'
}

function onDelete() {
  if (!guardSession()) return
  if (mode.value !== 'member' || !selectedId.value) return
  const idx = form.members.findIndex((m) => m.id === selectedId.value)
  if (idx !== -1) form.members.splice(idx, 1)
  mode.value = null
  selectedId.value = null
  persist()
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
}
</script>

<style src="./styles/AdminEquipmentPage.css" scoped></style>
