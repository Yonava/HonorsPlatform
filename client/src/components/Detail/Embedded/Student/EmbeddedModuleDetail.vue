<template>
  <EmbeddedDetailFrame titlePlaceholder="Course Code">

    <EmbeddedInput
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

    <EmbeddedInput
      :item="module"
      prop="instructor"
      :button="instructorSuggestions"
      icon="human-male-board"
      label="Instructor"
    />

    <InputCoupler>

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
          newPropValue: () => new Date().toLocaleDateString('en-US')
        }"
      />

    </InputCoupler>

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
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { getCurrentTerm, termInputValidator } from '@utils/terms'
import { useSheetManager } from '@store/useSheetManager'
import { useInstructorAutoComplete } from '@composables/useAutoComplete'
import type { Module } from '@apptypes/sheetItems'
import InputCoupler from '../../Helper/InputCoupler.vue'
import EmbeddedInput from '../EmbeddedInput.vue'
import EmbeddedDetailFrame from '../EmbeddedDetailFrame.vue'
import { useMoveItem } from '@composables/useMoveItem'

const { readOnlyMode, getActiveEmbeddedPanel, focusedEmbeddedItem } = storeToRefs(useSheetManager())

const module = computed(() => focusedEmbeddedItem.value as Module)
const instructor = computed(() => module.value.instructor)
const { button: instructorSuggestions } = useInstructorAutoComplete(instructor)

const { moveItem, movingItem } = useMoveItem('MODULES');
</script>