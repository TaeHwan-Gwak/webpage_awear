<template>
  <div v-if="open" class="confirm-modal-backdrop" @click.self="$emit('cancel')">
    <div class="confirm-modal">
      <h3 class="confirm-title">{{ title }}</h3>
      <p class="confirm-body">{{ message }}</p>
      <div class="confirm-actions">
        <button type="button" class="confirm-btn" @click="$emit('confirm')">{{ confirmLabel }}</button>
        <button type="button" class="cancel-btn" @click="$emit('cancel')">{{ cancelLabel }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
  }>(),
  { confirmLabel: 'Confirm', cancelLabel: 'Cancel' }
)

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<style src="./styles/ConfirmModal.css" scoped></style>
