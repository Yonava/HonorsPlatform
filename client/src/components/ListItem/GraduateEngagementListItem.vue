<template>
  <LIFrame
    :item="item"
    :styled="styled"
  >

    <template #left>

      <LITitle
        :primary="{
          text: item.event || '(No Event Name)',
          tooltip: 'Event Name',
        }"
      />

    </template>

    <template #right>

      <LIEmblem
        :color="getActivePanel.color"
        :text="dateTimeDisplay || '(No Date)'"
        :icon="item.dateTime ? 'calendar' : 'alert'"
        tooltip="Event Date"
      />

    </template>

    <template #corners>
      <LIBottomCorner :left="grad" />
    </template>

  </LIFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSheetManager } from '@store/useSheetManager';
import type { GradEngagement } from '@apptypes/sheetItems';
import { useStudentInfo } from '@composables/useStudentInfo'
import {
  LIFrame,
  LITitle,
  LIEmblem,
  LIBottomCorner,
} from './ListItemParts/ListItemExports'

const { getActivePanel } = useSheetManager()

const props = defineProps<{
  item: GradEngagement,
  styled?: boolean
}>()

const dateTimeDisplay = computed(() => {
  return props.item.dateTime.toLowerCase().split('at')[0]
})

const grad = computed(() => {
  const { studentInfo } = useStudentInfo(props.item.studentSysId)
  return studentInfo.value
})
</script>