<template>
  <DetailFrame :item="completedModule">
    <template #main>
      <DetailHeader
        :item="completedModule"
        placeholder="Course Code"
      >
        <LinkStudentButton :item="completedModule" />
      </DetailHeader>


      <InputCoupler>

        <DetailInput
          :item="completedModule"
          prop="completedDate"
          label="Date of Completion"
          icon="check"
          :button="{
            condition: !completedModule.completedDate,
            text: 'Completed Today',
            newPropValue: () => new Date().toLocaleDateString('en-US'),
          }"
        />

        <DetailInput
          :item="completedModule"
          prop="grade"
          :input="{
            type: 'select',
            items: grades.map(grade => !grade ? 'Ungraded' : grade),
          }"
          :button="{
            condition: !completedModule.grade,
            text: 'Mark As ' + grades[0],
            newPropValue: () => grades[0],
          }"
          label="Grade"
          icon="star"
        />

      </InputCoupler>

      <DetailInput
        :item="completedModule"
        prop="term"
        :rules="[(v) => termValidator(v) || 'Potentially Invalid Term']"
        :button="{
          condition: !completedModule.term,
          text: 'Current Term',
          newPropValue: () => getCurrentTerm(),
        }"
        label="Term"
        icon="calendar"
      />

      <DetailInput
        :item="completedModule"
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

      <InputCoupler>

        <DetailInput
          :item="completedModule"
          prop="docuSignCreated"
          icon="calendar-alert"
          label="DocuSign Created"
          :button="{
            condition: !completedModule.docuSignCreated,
            text: 'Created Today',
            newPropValue: () => new Date().toLocaleDateString('en-US'),
          }"
        />

        <DetailInput
          :item="completedModule"
          prop="docuSignCompleted"
          icon="calendar-check"
          label="DocuSign Completed"
          :button="{
            condition: !completedModule.docuSignCompleted,
            text: 'Completed Today',
            newPropValue: () => new Date().toLocaleDateString('en-US'),
          }"
        />

      </InputCoupler>

    </template>

    <template #buttons>
      <v-btn
        @click="moveItem(completedModule)"
        :disabled="readOnlyMode"
        :color="panelOnceMoved?.color + '-darken-2'"
        :loading="movingItem"
        size="large"
      >
        <v-icon
          class="mr-2"
          size="x-large"
        >
          {{ panelOnceMoved?.icon }}
        </v-icon>
        Move Back to {{ panelOnceMoved?.title.plural }}
      </v-btn>
    </template>
  </DetailFrame>
</template>

<script setup lang="ts">
import InputCoupler from './Helper/InputCoupler.vue'
import DetailInput from './Helper/DetailInput.vue'
import DetailHeader from './Helper/DetailHeader.vue'
import DetailFrame from './Helper/DetailFrame.vue'
import LinkStudentButton from './Helper/LinkStudentButton.vue'
import { type CompletedModule, grades } from '../../SheetTypes'
import { useSheetManager } from '@store/useSheetManager'
import { useMoveItem } from '../../MoveItems'
import { computed } from 'vue'
import { useInstructorAutoComplete } from '../../InstructorAutoComplete'
import { getCurrentTerm, termValidator } from '../../TermValidator'
import { storeToRefs } from 'pinia'

const sheetManager = useSheetManager()
const { readOnlyMode } = storeToRefs(sheetManager)

const props = defineProps<{
  item: CompletedModule
}>()

const completedModule = computed(() => props.item)
const instructor = computed(() => completedModule.value.instructor)

const {
  suggestedInstructor,
  sameInstructor,
  selectSuggestion,
  suggestionSelected,
  suggestionToString,
} = useInstructorAutoComplete(instructor)

const { moveItem, movingItem, panelOnceMoved } = useMoveItem()
</script>