<template>
  <v-sheet class="pa-4">

    <div
      class="d-flex align-center"
      style="gap: 12px"

    >

      <div>
        <ProfilePicture
          :src="announcement.posterPhoto"
            :style="{
            width: `${PFP_SIZE_PX}px`,
            height: `${PFP_SIZE_PX}px`,
          }"
        />
      </div>

      <div>

        <div class="d-flex flex-wrap" style="gap: 6px">
          <v-sheet
            v-for="panel in panelNamesDisplay"
            :key="panel.text"
            :color="panel.color + '-darken-1'"
            class="d-flex px-3 align-center"
            :style="{
              borderRadius: '50px',
              fontWeight: 'bold',
              gap: '4px',
            }"
          >
            <p>
              {{ panel.text }}
            </p>
            <v-icon size="small">
              mdi-close-circle
            </v-icon>
          </v-sheet>
        </div>

        <h1>
          {{ announcement.posterName }}
        </h1>

      </div>

    </div>

    <div>
      {{ expiryDateDisplay }}
    </div>

    <v-textarea
      v-model="announcement.content"
      no-resize
      label="Announcement"
      variant="outlined"
      prepend-inner-icon="mdi-message-text"
      style="margin-top: 12px"
    >
    </v-textarea>

    <div class="d-flex align-center">
      <v-btn
        :color="getActivePanel.color + '-darken-1'"
      >
        Update Announcement
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        color="red"
      >
        Delete Announcement
      </v-btn>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTimeAgo } from '@vueuse/core'
import { storeToRefs } from 'pinia';
import { panels } from '@panels'
import type { PanelName } from '@panels';
import { useSheetManager } from '@store/useSheetManager';
import { Announcement } from '@apptypes/misc'
import ProfilePicture from '../../ProfilePicture.vue';

const props = defineProps<{
  announcement: Announcement
}>()

const { getActivePanel } = storeToRefs(useSheetManager())

const PFP_SIZE_PX = 75;

const expiryDate = useTimeAgo(props.announcement.expiryDate)

const expiryDateDisplay = computed(() => {
  if (!props.announcement.expiryDate) {
    return 'This announcement is set to stay up indefinitely.'
  }
  return `This announcement is set to remain active until ${expiryDate.value}.`
})

const panelNamesDisplay = computed(() => {

  if (!props.announcement.associatedPanels) {
    console.warn('No associated panels found for announcement')
    return [{
      color: 'grey',
      text: 'All Panels'
    }]
  }

  const panelNames = props.announcement.associatedPanels
    .split(',')
    .filter((panelName) => panelName in panels) as PanelName[]

  if (panelNames.length === 0) {
    return [{
      color: 'grey',
      text: 'All Panels'
    }]
  }

  return panelNames.map((panelName) => {
    return {
      color: panels[panelName].color,
      text: panels[panelName].title.plural
    }
  })
})
</script>