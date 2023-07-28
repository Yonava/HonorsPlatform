<template>
  <EmbeddedDetailFrame
    v-model="selectedEvent.event"
    titlePlaceholder="Event Name"
  >
    <v-btn
      v-if="!selectedEvent.dateTime"
      @click="selectedEvent.dateTime = getNewDate()"
      :color="getActiveEmbeddedPanel.color + '-darken-2'"
      size="x-small"
      class="mb-3"
    >Now</v-btn>
    <v-text-field
      v-model="selectedEvent.dateTime"
      prepend-inner-icon="mdi-clock-outline"
      label="Date/Time"
      variant="outlined"
    ></v-text-field>
    <v-textarea
      v-model="selectedEvent.note"
      no-resize
      label="Note"
      variant="outlined"
    ></v-textarea>
  </EmbeddedDetailFrame>
</template>

<script setup lang="ts">
import EmbeddedDetailFrame from '../EmbeddedDetailFrame.vue'
import { useSheetManager } from '../../../../store/useSheetManager'
import { computed } from 'vue'
import type { GradEngagement } from '../../../../SheetTypes';

const { getActiveEmbeddedPanel, focusedEmbeddedItem } = useSheetManager()
const selectedEvent = computed(() => focusedEmbeddedItem as GradEngagement)

defineProps<{
  broadcastThroughSocket: (prop: keyof GradEngagement, value?: string | number | boolean) => void
}>()

const getNewDate = () => {
  const date = new Date()
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric'
  })
  const day = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  return `${day} at ${time}`
}
</script>