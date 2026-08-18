<template>
  <div class="google-map">
    <iframe src="https://maps.google.com/maps?q=35.228514,126.843128&hl=ko&z=17&output=embed" width="100%" height="400"
      style="border: 0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  address: string
}>()

</script>

<style src="./styles/GoogleMap.css" scoped></style>
