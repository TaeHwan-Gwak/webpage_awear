<template>
  <transition name="unsaved-fade">
    <div v-if="dirty" class="unsaved-bar">
      <span class="unsaved-label">Unsaved changes</span>
      <button type="button" class="cancel-btn" :disabled="saving" @click="$emit('cancel')">Cancel</button>
      <button type="button" class="save-btn" :disabled="saving" @click="$emit('save')">
        {{ saving ? 'Saving…' : 'Save' }}
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  dirty: boolean
  saving?: boolean
}>()

defineEmits<{
  save: []
  cancel: []
}>()
</script>

<style src="./styles/UnsavedChangesBar.css" scoped></style>
