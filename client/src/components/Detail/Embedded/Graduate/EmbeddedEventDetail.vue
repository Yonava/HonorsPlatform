<template>
  <EmbeddedDetailFrame titlePlaceholder="Event Name">

    <EmbeddedInput
      :item="event"
      prop="dateTime"
      icon="clock-outline"
      label="Date/Time"
      :button="{
        condition: !event.dateTime,
        newPropValue: () => getNewDate(),
        text: 'Current Time'
      }"
    />

  </EmbeddedDetailFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia';
import type { GradEngagement } from '@apptypes/sheetItems';
import { useSheetManager } from '@store/useSheetManager'
import EmbeddedInput from '../EmbeddedInput.vue';
import EmbeddedDetailFrame from '../EmbeddedDetailFrame.vue'

const sheetManager = useSheetManager()
const { focusedEmbeddedItem } = storeToRefs(sheetManager)
const event = computed(() => focusedEmbeddedItem.value as GradEngagement)

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