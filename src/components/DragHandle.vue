<template>
  <span v-if="isAdmin" class="drag-handle" aria-hidden="true">≡</span>
</template>

<script setup lang="ts">
import { useAdminMode } from '../composables/useAdminMode'

const { isAdmin } = useAdminMode()
</script>

<style src="./styles/DragHandle.css" scoped></style>
