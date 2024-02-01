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
          :button="dateAutoComplete(completedModule.dateCompleted)"
          :hint="fullDate(completedModule.dateCompleted)"
          persistent-hint
          prop="dateCompleted"
          label="Date of Completion"
          icon="check"
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
            text: grades[0],
            newPropValue: () => grades[0],
          }"
          label="Grade"
          icon="star"
        />

      </InputCoupler>

      <DetailInput
        :item="completedModule"
        :button="termSuggestions"
        :rules="termInputValidator()"
        prop="term"
        label="Term"
        icon="calendar"
      />

      <DetailInput
        :item="completedModule"
        :button="instructorSuggestions"
        prop="instructor"
        icon="human-male-board"
        label="Instructor"
      />

      <h1 class="mb-2">
        Documentation
      </h1>

      <InputCoupler>

        <DetailInput
          :item="completedModule"
          :button="dateAutoComplete(completedModule.docuSignCreated)"
          :hint="fullDate(completedModule.docuSignCreated)"
          persistent-hint
          prop="docuSignCreated"
          icon="calendar-alert"
          label="DocuSign Created"
        />

        <DetailInput
          :item="completedModule"
          :button="dateAutoComplete(completedModule.docuSignCompleted)"
          :hint="fullDate(completedModule.docuSignCompleted)"
          persistent-hint
          prop="docuSignCompleted"
          icon="calendar-check"
          label="DocuSign Completed"
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
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSheetManager } from '@store/useSheetManager'
import { termInputValidator } from '@utils/terms'
import { fullDate } from '@utils/dates'
import {
  useInstructorAutoComplete,
  useTermCodeAutoComplete,
  dateAutoComplete
} from '@composables/useAutoComplete'
import type { CompletedModule } from '@apptypes/sheetItems'
import { grades } from '@apptypes/misc'
import { useMoveItem } from '@composables/useMoveItem'

import InputCoupler from './Helper/InputCoupler.vue'
import DetailInput from './Helper/DetailInput.vue'
import DetailHeader from './Helper/DetailHeader.vue'
import DetailFrame from './Helper/DetailFrame.vue'
import LinkStudentButton from './Helper/LinkStudentButton.vue'

const sheetManager = useSheetManager()
const { readOnlyMode } = storeToRefs(sheetManager)

const props = defineProps<{
  item: CompletedModule
}>()

const completedModule = computed(() => props.item)
const { button: instructorSuggestions } = useInstructorAutoComplete(completedModule.value)
const { button: termSuggestions } = useTermCodeAutoComplete(completedModule.value)

const { moveItem, movingItem, panelOnceMoved } = useMoveItem()
</script>