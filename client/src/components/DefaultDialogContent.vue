<template>
  <v-sheet class="pa-5">
    <h1>
      {{ body.title }}
    </h1>
    <p class="my-3">
      {{ body.description }}
    </p>
    <v-btn
      v-for="button in body.buttons"
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
import type { DialogBody } from '../store/useDialog'

const props = defineProps<{
  body: DialogBody
}>()
</script>