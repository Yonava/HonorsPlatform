<template>
  <DetailFrame v-model="event.note">
    <template #main>
      <DetailHeader
        v-model="event.event"
        :id="event.gradId"
        placeholder="Event Name"
      />
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

import { toRefs } from 'vue'
import { useDocumentCache } from '../../store/useDocumentCache'
import { useUpdateItem } from '../../TrackItemForUpdate'

const { "Grad Engagements": gradEngagements } = useDocumentCache()
const { selected: event } = toRefs(gradEngagements)
useUpdateItem(event)
</script>