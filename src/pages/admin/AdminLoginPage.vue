<template>
  <main class="admin-login">
    <form class="panel" @submit.prevent="onSubmit">
      <p class="eyebrow">AWEAR Lab</p>
      <h1>Admin</h1>

      <label class="field">
        <span>Password</span>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          autofocus
          @input="error = false"
        />
      </label>

      <p v-if="error" class="error">Incorrect password.</p>

      <button type="submit" class="btn">Enter</button>
    </form>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loginAdmin } from '../../composables/useAdminAuth'

const route = useRoute()
const router = useRouter()

const password = ref('')
const error = ref(false)

function onSubmit() {
  if (loginAdmin(password.value)) {
    const redirect = (route.query.redirect as string) || '/admin'
    router.replace(redirect)
  } else {
    error.value = true
  }
}
</script>

<style src="./styles/AdminLoginPage.css" scoped></style>
