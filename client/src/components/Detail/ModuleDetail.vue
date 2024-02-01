<template>
  <DetailFrame :item="module">
    <template #main>
      <DetailHeader
        :item="module"
        placeholder="Course Code"
      >
        <LinkStudentButton :item="module"/>
      </DetailHeader>

      <DetailInput
        :item="module"
        prop="term"
        :button="termSuggestions"
        :rules="termInputValidator()"
        label="Term"
        icon="calendar"
      />

      <DetailInput
        :item="module"
        prop="instructor"
        :button="instructorSuggestions"
        icon="human-male-board"
        label="Instructor"
      />

      <h1 class="mb-2">
        Documentation
      </h1>

      <InputCoupler>

        <DetailInput
          :item="module"
          :button="dateAutoComplete(module.docuSignCreated)"
          :hint="fullDate(module.docuSignCreated)"
          persistent-hint
          prop="docuSignCreated"
          icon="calendar-alert"
          label="DocuSign Created"
        />

        <DetailInput
          :item="module"
          :button="dateAutoComplete(module.docuSignCompleted)"
          :hint="fullDate(module.docuSignCompleted)"
          persistent-hint
          prop="docuSignCompleted"
          icon="calendar-check"
          label="DocuSign Completed"
        />

      </InputCoupler>

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
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { getPanel } from '@panels'
import { useSheetManager } from '@store/useSheetManager'
import { termInputValidator } from '@utils/terms'
import { fullDate } from '@utils/dates'
import {
  useInstructorAutoComplete,
  useTermCodeAutoComplete,
  dateAutoComplete
} from '@composables/useAutoComplete'
import { useMoveItem } from '@composables/useMoveItem'
import type { Module } from '@apptypes/sheetItems'
import InputCoupler from './Helper/InputCoupler.vue'
import DetailInput from './Helper/DetailInput.vue'
import DetailHeader from './Helper/DetailHeader.vue'
import DetailFrame from './Helper/DetailFrame.vue'
import LinkStudentButton from './Helper/LinkStudentButton.vue'

const props = defineProps<{
  item: Module
}>()

const module = computed(() => props.item)
const { button: instructorSuggestions } = useInstructorAutoComplete(module.value)
const { button: termSuggestions } = useTermCodeAutoComplete(module.value)

const sheetManager = useSheetManager()
const { readOnlyMode } = storeToRefs(sheetManager)

const modulesPanel = getPanel('MODULES')
const color = modulesPanel.color + '-darken-2'

const { moveItem, movingItem, panelOnceMoved } = useMoveItem()
</script>