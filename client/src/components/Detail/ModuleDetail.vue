<template>
  <DetailFrame :item="module">
    <template #main>
      <DetailHeader
        :item="module"
        placeholder="Course Code"
      >
        <LinkStudentButton
          @update="broadcastThroughSocket('studentSysId')"
          :item="module"
        />
      </DetailHeader>

      <DetailInput
        :item="module"
        prop="term"
        :button="{
          condition: !module.term,
          text: 'Current Term',
          newPropValue: () => getCurrentTerm(),
        }"
        :rules="[(v) => termValidator(v) || 'Potentially invalid term']"
        label="Term"
        icon="calendar"
      />

      <DetailInput
        :item="module"
        prop="instructor"
        :button="{
          condition: !sameInstructor && !suggestionSelected,
          text: suggestionToString,
          newPropValue: () => selectSuggestion(),
        }"
        icon="human-male-board"
        label="Instructor"
      />

      <h1 class="mb-2">
        Documentation
      </h1>

      <DetailInput
        :item="module"
        prop="docuSignCreated"
        icon="calendar-alert"
        label="DocuSign Created"
        :button="{
          condition: !module.docuSignCreated,
          text: 'Created Today',
          newPropValue: () => new Date().toLocaleDateString('en-US'),
        }"
      />

      <DetailInput
        :item="module"
        prop="docuSignCompleted"
        icon="calendar-check"
        label="DocuSign Completed"
        :button="{
          condition: !module.docuSignCompleted,
          text: 'Completed Today',
          newPropValue: () => new Date().toLocaleDateString('en-US'),
        }"
      />

    </template>

    <template #buttons>
      <v-btn
        @click="moveItem(module)"
        :disabled="readOnlyMode"
        :loading="movingItem"
        :color="color"
        size="large"
      >
        <v-icon
          class="mr-2"
          size="x-large"
        >
          {{ panelOnceMoved?.icon }}
        </v-icon>
        Complete Module
      </v-btn>
    </template>

  </DetailFrame>
</template>

<script setup lang="ts">
import DetailInput from './Helper/DetailInput.vue'
import DetailHeader from './Helper/DetailHeader.vue'
import DetailFrame from './Helper/DetailFrame.vue'
import LinkStudentButton from './Helper/LinkStudentButton.vue'

import { computed } from 'vue'
import type { Module } from '../../SheetTypes'
import { termValidator, getCurrentTerm } from '../../TermValidator'
import { useInstructorAutoComplete } from '../../InstructorAutoComplete'
import { getPanel } from '../../Panels'
import { useMoveItem } from '../../MoveItems'
import { useUpdateItem } from '../../TrackItemForUpdate'
import { useSheetManager } from '../../store/useSheetManager'
import { storeToRefs } from 'pinia'

const sheetManager = useSheetManager()
const { readOnlyMode } = storeToRefs(sheetManager)

const modulesPanel = getPanel('MODULES')

const color = modulesPanel.color + '-darken-2'

const props = defineProps<{
  item: Module
}>()

const module = computed(() => props.item)
const instructor = computed(() => module.value.instructor)

const {
  suggestedInstructor,
  sameInstructor,
  selectSuggestion,
  suggestionSelected,
  suggestionToString
} = useInstructorAutoComplete(instructor)

const { broadcastThroughSocket } = useUpdateItem(module)

const { moveItem, movingItem, panelOnceMoved } = useMoveItem()
</script>