<template>
  <div>
    <v-icon size="x-large">mdi-lock</v-icon>
    <h1>
      {{ title }} Locked
    </h1>
    <p>
      Add a {{ condition }} to this profile to unlock {{ title.toLowerCase() }}.
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string,
  condition: string
}>()
</script>