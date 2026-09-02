<template>
  <div class="admin-members">
    <p class="eyebrow">Admin</p>
    <h1>멤버 관리</h1>

    <section class="block">
      <h2>Principal Investigator</h2>
      <div class="grid">
        <label class="field">
          <span>이름</span>
          <input v-model="form.pi.name" type="text" />
        </label>
        <label class="field">
          <span>소속·직함</span>
          <input v-model="form.pi.role" type="text" />
        </label>
        <label class="field span-2">
          <span>소개</span>
          <textarea v-model="form.pi.bio" rows="3"></textarea>
        </label>
        <label class="field">
          <span>이메일</span>
          <input v-model="form.pi.email" type="text" />
        </label>
      </div>
    </section>

    <section class="block">
      <h2>그룹</h2>
      <label class="field">
        <span>그룹명</span>
        <input v-model="form.groupTitle" type="text" />
      </label>

      <ul class="member-list">
        <li v-for="(member, i) in form.members" :key="member.id" class="member-row">
          <label class="field">
            <span>이름</span>
            <input v-model="member.name" type="text" />
          </label>
          <label class="field">
            <span>역할</span>
            <input v-model="member.role" type="text" />
          </label>
          <label class="field">
            <span>비고</span>
            <input v-model="member.note" type="text" />
          </label>
          <button type="button" class="remove" @click="removeMember(i)">삭제</button>
        </li>
      </ul>

      <button type="button" class="add" @click="addMember">+ 멤버 추가</button>
    </section>

    <div class="save-bar">
      <button type="button" class="btn" :disabled="saving" @click="onSave">
        {{ saving ? '저장 중...' : '저장하기' }}
      </button>
      <p v-if="status === 'ok'" class="status ok">저장했습니다.</p>
      <p v-if="status === 'error'" class="status error">저장에 실패했습니다. (dev 서버가 실행 중인지 확인해주세요)</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import membersData from '../../data/members.json'

interface Member {
  id: string
  name: string
  role: string
  note: string
}

const form = reactive({
  pi: { ...membersData.pi },
  groupTitle: membersData.groupTitle,
  members: membersData.members.map((m): Member => ({ ...m })),
})

const saving = ref(false)
const status = ref<'idle' | 'ok' | 'error'>('idle')

function addMember() {
  form.members.push({ id: 'm' + Date.now(), name: '', role: '', note: '' })
}

function removeMember(i: number) {
  form.members.splice(i, 1)
}

async function onSave() {
  saving.value = true
  status.value = 'idle'
  try {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    status.value = res.ok ? 'ok' : 'error'
  } catch {
    status.value = 'error'
  } finally {
    saving.value = false
  }
}
</script>

<style src="./styles/AdminMemberPage.css" scoped></style>
