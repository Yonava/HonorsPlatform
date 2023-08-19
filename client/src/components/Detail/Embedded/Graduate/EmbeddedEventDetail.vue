<template>
  <EmbeddedDetailFrame
    v-model="selectedEvent.event"
    titlePlaceholder="Event Name"
  >

    <EmbeddedInput
      :item="selectedEvent"
      prop="dateTime"
      icon="clock-outline"
      label="Date/Time"
      :button="{
        condition: !selectedEvent.dateTime,
        newPropValue: () => getNewDate(),
        text: 'Current Time'
      }"
    />

    <v-textarea
      v-model="selectedEvent.note"
      @input="broadcastThroughSocket('note')"
      no-resize
      label="Note"
      variant="outlined"
    ></v-textarea>
  </EmbeddedDetailFrame>
</template>

<script setup lang="ts">
import EmbeddedInput from '../EmbeddedInput.vue';
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