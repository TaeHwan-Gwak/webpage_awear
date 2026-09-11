<template>
  <span v-if="isAdmin" class="admin-controls">
    <button type="button" class="icon-btn edit" aria-label="Edit" @click="$emit('edit')">✎</button>
    <button v-if="!hideDelete" type="button" class="icon-btn delete" aria-label="Delete" @click="$emit('delete')">✕</button>
  </span>
</template>

<script setup lang="ts">
import { useAdminMode } from '../composables/useAdminMode'

withDefaults(defineProps<{ hideDelete?: boolean }>(), { hideDelete: false })

const { isAdmin } = useAdminMode()

defineEmits<{
  edit: []
  delete: []
}>()
</script>

<style src="./styles/AdminEditControls.css" scoped></style>
