<template>
  <v-sheet class="pa-4">
    <h1>{{ announcement.posterName }}</h1>
    <p>{{ announcement.content }}</p>
  </v-sheet>
</template>

<script setup lang="ts">
import { Announcement } from '@apptypes/misc'

defineProps<{
  announcement: Announcement
}>()
</script>