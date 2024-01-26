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
        :button="{
          condition: !module.term,
          text: 'Current Term',
          newPropValue: () => getCurrentTerm(),
        }"
        :rules="termInputValidator()"
        label="Term"
        icon="calendar"
      />

      <DetailInput
        :item="module"
        prop="instructor"
        :button="button"
        icon="human-male-board"
        label="Instructor"
      />

      <h1 class="mb-2">
        Documentation
      </h1>

      <InputCoupler>

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
import { useSheetManager } from '@store/useSheetManager'
import { getCurrentTerm, termInputValidator } from '@utils/TermValidator'
import { getPanel } from '@panels'
import type { Module } from '@apptypes/sheetItems'
import InputCoupler from './Helper/InputCoupler.vue'
import DetailInput from './Helper/DetailInput.vue'
import DetailHeader from './Helper/DetailHeader.vue'
import DetailFrame from './Helper/DetailFrame.vue'
import LinkStudentButton from './Helper/LinkStudentButton.vue'
import { useInstructorAutoComplete_v2 } from '../../InstructorAutoComplete'
import { useMoveItem } from '../../MoveItems'

const props = defineProps<{
  item: Module
}>()

const module = computed(() => props.item)
const instructor = computed(() => module.value?.instructor)
const { button } = useInstructorAutoComplete_v2(instructor)

const sheetManager = useSheetManager()
const { readOnlyMode } = storeToRefs(sheetManager)

const modulesPanel = getPanel('MODULES')
const color = modulesPanel.color + '-darken-2'

const { moveItem, movingItem, panelOnceMoved } = useMoveItem()
</script>