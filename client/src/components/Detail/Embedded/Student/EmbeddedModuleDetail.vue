<template>
  <EmbeddedDetailFrame
    v-model="module.courseCode"
    @input="broadcastThroughSocket('courseCode')"
    titlePlaceholder="Course Code"
  >

    <EmbeddedInput
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

    <EmbeddedInput
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

    <div class="d-flex flex-row">
      <EmbeddedInput
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

      <EmbeddedInput
        :item="module"
        prop="docuSignCompleted"
        icon="calendar-check"
        label="DocuSign Completed"
        :button="{
          condition: !module.docuSignCompleted,
          text: 'Completed Today',
          newPropValue: () => new Date().toLocaleDateString('en-US'),
        }"
        class="ml-4"
      />
    </div>

    <template #right-button>
      <v-btn
        @click="moveItem(module)"
        :loading="movingItem"
        :disabled="readOnlyMode"
        variant="outlined"
        :color="getActiveEmbeddedPanel.color + '-darken-2'"
      >
        complete
      </v-btn>
    </template>
  </EmbeddedDetailFrame>
</template>

<script setup lang="ts">
import EmbeddedInput from '../EmbeddedInput.vue'
import EmbeddedDetailFrame from '../EmbeddedDetailFrame.vue'
import { useSheetManager } from '../../../../store/useSheetManager'
import { computed } from 'vue'
import { termValidator, getCurrentTerm } from '../../../../TermValidator'
import { useInstructorAutoComplete } from '../../../../InstructorAutoComplete'
import type { Module } from '../../../../SheetTypes'
import { useMoveItem } from '../../../../MoveItems'
import { storeToRefs } from 'pinia'

const { readOnlyMode, getActiveEmbeddedPanel, focusedEmbeddedItem } = storeToRefs(useSheetManager())
const module = computed(() => focusedEmbeddedItem.value as Module)
const instructor = computed(() => module.value.instructor || '')

const {
  sameInstructor,
  selectSuggestion,
  suggestionSelected,
  suggestionToString
} = useInstructorAutoComplete(instructor)

const { moveItem, movingItem } = useMoveItem('MODULES');
</script>