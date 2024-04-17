<template>
  <v-sheet
    @click.stop
    class="d-flex flex-column announcement pa-3 mb-2"
    style="gap: 12px; position: relative;"
    ref="announcementItem"
    color="grey-lighten-4"
  >

    <div class="d-flex align-center">

      <img
        :src="announcement.posterPhoto"
        alt="Poster Photo"
        :style="{
          width: '50px',
          height: '50px',
          objectFit: 'cover',
          borderRadius: '50%',
          boxShadow: '0 0 5px 0 rgba(0, 0, 0, 0.2)'
        }"
      />

      <div class="ml-3">
        <h4>
          {{ announcement.posterName }}
        </h4>

        <AnnouncementDate
          :date="announcement.datePosted"
        />
      </div>
    </div>

      <!-- p tag should break up words before overflowing -->
      <p style="word-break: break-word;">
        {{ announcement.content }}
      </p>


      <v-spacer></v-spacer>

  </v-sheet>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Announcement } from '@apptypes/misc'
import AnnouncementDate from './AnnouncementDate.vue'

const announcementItem = ref()

defineProps<{
  announcement: Announcement
}>()
</script>