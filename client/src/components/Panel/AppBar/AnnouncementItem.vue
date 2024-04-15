<template>
  <v-sheet
    class="d-flex announcement pa-3 mb-2"
    style="gap: 12px; position: relative;"
    ref="announcementItem"
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
      <AnnouncementDate
        v-if="collapseDate"
        :date="announcement.datePosted"
      />
      <p>
        {{ announcement.content }}
      </p>
    </div>

    <v-spacer></v-spacer>

    <AnnouncementDate
      v-if="!collapseDate"
      :date="announcement.datePosted"
    />

  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useElementSize } from '@vueuse/core'
import type { Announcement } from '@apptypes/misc'
import AnnouncementDate from './AnnouncementDate.vue'

const announcementItem = ref()
const { width } = useElementSize(announcementItem)

const collapseDate = computed(() => width.value < 420)

defineProps<{
  announcement: Announcement
}>()
</script>