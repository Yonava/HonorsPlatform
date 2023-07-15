<template>
  <DetailFrame
    v-model="event.note"
    :item="event"
  >
    <template #main>
      <DetailHeader
        v-model="event.event"
        :item="event"
        placeholder="Event Name"
      >
        <LinkStudentButton
          linkFrom="graduates"
          :item="event"
        />
      </DetailHeader>
      <v-text-field
        v-model="event.dateTime"
        label="Time"
        prepend-icon="mdi-clock-outline"
      >
      </v-text-field>
    </template>
    <template #buttons>
    </template>
  </DetailFrame>
</template>

<script setup lang="ts">
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

useUpdateItem(event)
</script>