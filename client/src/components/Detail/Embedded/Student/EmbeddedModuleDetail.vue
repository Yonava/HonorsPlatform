<template>
  <EmbeddedDetailFrame titlePlaceholder="Course Code">

    <EmbeddedInput
      :item="module"
      prop="term"
      :button="termSuggestions"
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
        :button="dateAutoComplete(module.docuSignCreated)"
        :hint="fullDate(module.docuSignCreated)"
        persistent-hint
        prop="docuSignCreated"
        icon="calendar-alert"
        label="DocuSign Created"
      />

      <EmbeddedInput
        :item="module"
        :button="dateAutoComplete(module.docuSignCompleted)"
        :hint="fullDate(module.docuSignCompleted)"
        persistent-hint
        prop="docuSignCompleted"
        icon="calendar-check"
        label="DocuSign Completed"
      />

    </InputCoupler>

    <template #right-button>
      <v-btn
        @click="moveItem(module)"
        :loading="movingItem"
        :disabled="readOnlyMode"
        variant="outlined"
        :color="getActiveEmbeddedPanel!.color + '-darken-2'"
      >
        complete
      </v-btn>
    </template>
  </EmbeddedDetailFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { termInputValidator } from '@utils/terms'
import { fullDate } from '@utils/dates'
import { useSheetManager } from '@store/useSheetManager'
import {
  dateAutoComplete,
  useInstructorAutoComplete,
  useTermCodeAutoComplete
} from '@composables/useAutoComplete'
import type { Module } from '@apptypes/sheetItems'
import InputCoupler from '../../Helper/InputCoupler.vue'
import EmbeddedInput from '../EmbeddedInput.vue'
import EmbeddedDetailFrame from '../EmbeddedDetailFrame.vue'
import { useMoveItem } from '@composables/useMoveItem'

const { readOnlyMode, getActiveEmbeddedPanel, focusedEmbeddedItem } = storeToRefs(useSheetManager())

const module = computed(() => focusedEmbeddedItem.value as Module)
const { button: instructorSuggestions } = useInstructorAutoComplete(module.value)
const { button: termSuggestions } = useTermCodeAutoComplete(module.value)

const { moveItem, movingItem } = useMoveItem('MODULES');
</script>