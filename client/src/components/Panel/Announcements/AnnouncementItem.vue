<template>
  <v-sheet
    @click.stop="selected"
    @mouseover="isHovered = true"
    @mouseleave="isHovered = false"
    :color="itemColor"
    class="d-flex flex-column announcement pa-3 mb-2"
    style="gap: 12px; position: relative; cursor: pointer; transition: background-color 0.3s;"
    ref="announcementItem"
  >

    <div class="d-flex align-center">

      <ProfilePicture
        :src="announcement.posterPhoto"
        :style="{
          width: '50px',
          height: '50px',
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

    <p style="word-break: break-word;">
      {{ announcement.content }}
    </p>

  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDialog } from '@store/useDialog'
import type { Announcement } from '@apptypes/misc'
import AnnouncementDate from './AnnouncementDate.vue'
import AnnouncementDetail from './AnnouncementDetail.vue'
import ProfilePicture from '../../ProfilePicture.vue';

const props = defineProps<{
  announcement: Announcement
}>()

const announcementItem = ref()
const isHovered = ref(false)

const itemColor = computed(() => {
  return isHovered.value ? 'grey-lighten-2' : 'grey-lighten-4'
})

const selected = () => {
  useDialog().open({
    component: AnnouncementDetail,
    props: {
      announcement: props.announcement
    }
  })
}
</script>