<template>
  <v-sheet
    class="d-flex flex-row announcement pa-3 mb-2"
    style="gap: 12px; position: relative;"
    color="grey-lighten-3"
  >

    <img
      :src="announcement.posterPhoto"
      alt="Poster Photo"
      style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%; box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.2);"
    />

    <div>
      <h4>
        {{ announcement.posterName }}
      </h4>
      <p>
        {{ announcement.content }}
      </p>
    </div>

    <v-spacer></v-spacer>

    <AnnouncementDate :date="announcement.datePosted" />

  </v-sheet>
</template>

<script setup lang="ts">
import type { Announcement } from '@apptypes/misc'
import AnnouncementDate from './AnnouncementDate.vue'

defineProps<{
  announcement: Announcement
}>()
</script>