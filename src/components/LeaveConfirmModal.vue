<template>
  <div v-if="open" class="leave-modal-backdrop">
    <div class="leave-modal">
      <h3>You have unsaved changes</h3>
      <p>Save them before leaving this page, or discard them?</p>
      <div class="leave-actions">
        <button type="button" class="save-btn" @click="$emit('save-and-leave')">Save & Leave</button>
        <button type="button" class="discard-btn" @click="$emit('discard-and-leave')">Discard & Leave</button>
        <button type="button" class="stay-btn" @click="$emit('stay')">Stay</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
}>()

defineEmits<{
  'save-and-leave': []
  'discard-and-leave': []
  stay: []
}>()
</script>

<style src="./styles/LeaveConfirmModal.css" scoped></style>
