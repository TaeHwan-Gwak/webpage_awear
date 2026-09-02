<template>
  <div class="admin-members">
    <p class="eyebrow">Admin</p>
    <h1>멤버 관리</h1>

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

        <button type="button" class="add-btn" @click="startAdd">+ 추가</button>
      </aside>

      <section class="detail-panel">
        <p v-if="mode === null" class="empty-hint">왼쪽에서 멤버를 선택하거나, [+ 추가]를 눌러 새로 등록하세요.</p>

        <form v-else class="detail-form" @submit.prevent="onSave">
          <template v-if="mode === 'pi'">
            <label class="field">
              <span>이름</span>
              <input v-model="form.pi.name" type="text" placeholder="이름을 입력하세요" />
            </label>
            <label class="field">
              <span>소속·직함</span>
              <input v-model="form.pi.role" type="text" placeholder="예: GIST AI학과 교수" />
            </label>
            <label class="field">
              <span>소개</span>
              <textarea v-model="form.pi.bio" rows="4" placeholder="소개 문구를 입력하세요"></textarea>
            </label>
            <label class="field">
              <span>이메일</span>
              <input v-model="form.pi.email" type="text" placeholder="example@gist.ac.kr" />
            </label>
          </template>

          <template v-else-if="mode === 'member' && activeMember">
            <label class="field">
              <span>이름</span>
              <input v-model="activeMember.name" type="text" placeholder="이름을 입력하세요" />
            </label>
            <label class="field">
              <span>역할</span>
              <input v-model="activeMember.role" type="text" placeholder="예: 석사과정" />
            </label>
            <label class="field">
              <span>비고</span>
              <input v-model="activeMember.note" type="text" placeholder="선택 입력 사항" />
            </label>
          </template>

          <template v-else-if="mode === 'new'">
            <label class="field">
              <span>이름</span>
              <input v-model="draft.name" type="text" placeholder="이름을 입력하세요" />
            </label>
            <label class="field">
              <span>역할</span>
              <input v-model="draft.role" type="text" placeholder="예: 석사과정" />
            </label>
            <label class="field">
              <span>비고</span>
              <input v-model="draft.note" type="text" placeholder="선택 입력 사항" />
            </label>
          </template>

          <div class="actions">
            <button type="submit" class="btn save">저장</button>
            <button v-if="mode === 'member'" type="button" class="btn delete" @click="onDelete">
              삭제
            </button>
          </div>

          <p v-if="status === 'ok'" class="status ok">저장했습니다. (이 브라우저에만 임시 저장됨)</p>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import membersData from '../../data/members.json'

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

const STORAGE_KEY = 'awear-admin-members-draft'

function loadInitial(): MembersForm {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      return JSON.parse(saved) as MembersForm
    } catch {
      // 저장된 값이 깨졌으면 원본 JSON으로 폴백
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
  mode.value = 'new'
  selectedId.value = null
  draft.name = ''
  draft.role = ''
  draft.note = ''
  status.value = 'idle'
}

function onSave() {
  if (mode.value === 'new') {
    const id = 'm' + Date.now()
    form.members.push({ id, name: draft.name, role: draft.role, note: draft.note })
    selectMember(id)
  }
  persist()
  status.value = 'ok'
}

function onDelete() {
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

<style src="./styles/AdminMemberPage.css" scoped></style>
