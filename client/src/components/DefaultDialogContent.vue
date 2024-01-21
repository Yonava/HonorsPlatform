<template>
  <v-sheet class="pa-5">
    <h1>
      {{ title }}
    </h1>
    <p class="my-3">
      {{ description }}
    </p>
    <v-btn
      v-for="button in buttons"
      :key="button.text"
      @click="button.onClick"
      :color="button.color"
      class="mr-3 mb-3"
    >
      {{ button.text }}
    </v-btn>
  </v-sheet>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  buttons?: {
    text: string
    color?: string
    onClick: () => void
  }[]
}>()
</script>