<template>
  <DetailFrame v-model="event.note">
    <template #main>
      <DetailHeader
        v-model="event.event"
        placeholder="Event Name"
      >
        <LinkStudentButton linkFrom="graduates" />
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

import { GradEngagement } from '../../SheetTypes'
import { toRefs, Ref } from 'vue'
import { useDocumentCache } from '../../store/useDocumentCache'
import { useUpdateItem } from '../../TrackItemForUpdate'

const { "Grad Engagements": gradEngagements } = useDocumentCache()
const { selected } = toRefs(gradEngagements)
const event = selected as Ref<GradEngagement>
useUpdateItem(event)
</script>