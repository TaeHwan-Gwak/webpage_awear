<template>
  <button v-if="isAdmin" type="button" class="admin-add-btn" @click="$emit('add')">
    + {{ label }}
  </button>
</template>

<script setup lang="ts">
import { useAdminMode } from '../composables/useAdminMode'

withDefaults(defineProps<{ label?: string }>(), { label: 'Add' })

const { isAdmin } = useAdminMode()

defineEmits<{
  add: []
}>()
</script>

<style src="./styles/AdminAddButton.css" scoped></style>
