<template>
  <v-sheet class="pa-4">

    <div
      class="d-flex align-center"
      style="gap: 12px"
    >

      <div
        :style="{
          width: `${PFP_SIZE_PX}px`,
          height: `${PFP_SIZE_PX}px`,
        }"
      >
        <ProfilePicture
          :src="announcement.posterPhoto"
        />
      </div>

      <div>

        <v-sheet
          v-for="panel in panelNamesDisplay"
          :key="panel.text"
          :color="panel.color"
          class="px-2"
          :style="{
            color: 'white',
            borderRadius: '50px',
            display: 'inline-block',
            marginRight: '4px',
          }"
        >
          {{ panel.text }}
        </v-sheet>

        <h1>{{ announcement.posterName }}</h1>

      </div>

    </div>

    <p>{{ announcement.content }}</p>

    <br>

    <!-- <div>
      {{ JSON.stringify(announcement, null, 2) }}
    </div> -->
  </v-sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { panels } from '@panels'
import type { PanelName } from '@panels';
import { Announcement } from '@apptypes/misc'
import ProfilePicture from '../../ProfilePicture.vue';

const props = defineProps<{
  announcement: Announcement
}>()

const PFP_SIZE_PX = 75;

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