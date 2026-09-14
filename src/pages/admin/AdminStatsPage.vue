<template>
  <main class="admin-stats-page">
    <template v-if="isAdmin">
      <p class="eyebrow">Admin</p>
      <h1>Site Stats</h1>
      <p class="desc">
        Visitor numbers and search performance aren't pulled into this page yet — that would need an API key and a
        small backend call we haven't built. For now, here's where to check them directly.
      </p>

      <div class="stat-cards">
        <a class="stat-card" href="https://vercel.com/dashboard" target="_blank" rel="noopener">
          <h2>Vercel Analytics</h2>
          <p>Visitor counts, page views, and top pages for this deployment.</p>
          <span class="link">Open Vercel dashboard →</span>
        </a>

        <a class="stat-card" href="https://search.google.com/search-console" target="_blank" rel="noopener">
          <h2>Google Search Console</h2>
          <p>Search queries, click-through rate, and ranking for awearlab.com.</p>
          <span class="link">Open Search Console →</span>
        </a>
      </div>

      <p class="note">
        Ask to have either of these wired up so the numbers show directly on this page.
      </p>
    </template>

    <p v-else class="not-authorized">You need to be logged in as admin to view this page.</p>
  </main>
</template>

<script setup lang="ts">
import { useAdminMode } from '../../composables/useAdminMode'

const { isAdmin } = useAdminMode()
</script>

<style src="./styles/AdminStatsPage.css" scoped></style>
