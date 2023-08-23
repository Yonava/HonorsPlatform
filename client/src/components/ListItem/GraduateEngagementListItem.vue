<template>
  <LIFrame
    :item="item"
    :styled="styled"
    :bottomCorners="[grad]"
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
        :text="dateTimeDisplay"
        tooltip="Event Date"
        :icon="item.dateTime ? 'calendar' : 'alert'"
      />

    </template>

  </LIFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStudentInfo } from './useStudentInfo'
import { useSheetManager } from '../../store/useSheetManager';
import type { GradEngagement } from '../../SheetTypes';
import {
  LIFrame,
  LITitle,
  LIEmblem,
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