<template>
  <v-app-bar :color="color">
    <PanelTitle />
  </v-app-bar>
</template>

<script setup lang="ts">
import PanelTitle from "./PanelTitle.vue";

defineProps<{
  color: string
}>()
</script>