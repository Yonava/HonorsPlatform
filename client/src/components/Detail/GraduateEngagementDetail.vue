<template>
  <DetailFrame :item="event">
    <template #main>
      <DetailHeader
        :item="event"
        placeholder="Event Name"
      >
        <LinkStudentButton
          @update="broadcastThroughSocket('studentSysId')"
          linkFrom="graduates"
          :item="event"
        />
      </DetailHeader>

      <DetailInput
        :item="event"
        prop="dateTime"
        icon="clock-outline"
        label="Time"
        :button="{
          condition: !event.dateTime,
          text: 'Current Time',
          newPropValue: getNewDate,
        }"
      />

    </template>

    <template #buttons></template>
  </DetailFrame>
</template>

<script setup lang="ts">
import DetailInput from './Helper/DetailInput.vue'
import DetailHeader from './Helper/DetailHeader.vue'
import DetailFrame from './Helper/DetailFrame.vue'
import LinkStudentButton from './Helper/LinkStudentButton.vue'

import type { GradEngagement } from '../../SheetTypes'
import { computed } from 'vue'
import { useUpdateItem } from '../../TrackItemForUpdate'

const props = defineProps<{
  item: GradEngagement
}>()

const event = computed(() => props.item)

const { broadcastThroughSocket } = useUpdateItem(event)

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