<template>
  <LIFrame :item="item">
    <template #left>

      <LITitle
        :primary="{
        text: item.courseCode || '(No Course Code)',
        tooltip: 'Course Code',
      }"
        :secondary="{
        text: item.term || '(No Term)',
        tooltip: termValid ? 'Term' : 'Term (Potentially Invalid)',
        error: !termValid
      }"
      />

    </template>

    <template #right>

      <LIEmblem
        :text="emblem.text"
        :color="emblem.color"
        :icon="emblem.icon"
        :tooltip="modulePanel.title.singular + ' Grade'"
      />

    </template>

    <template #corners>
      <LIBottomCorner
        :left="{
          text: item.dateCompleted ? `Completed ${item.dateCompleted}` : 'No Completion Date',
          icon: item.dateCompleted ? 'calendar-check' : 'calendar-remove',
          tooltip: item.dateCompleted && `Date of Completion (${timeAgoDayPrecision(item.dateCompleted)})`,
        }"
        :right="student"
      />
    </template>
  </LIFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getPanel } from '@panels'
import { termValidator } from '@utils/terms'
import { timeAgoDayPrecision } from '@utils/dates'
import { useStudentInfo } from '@composables/useStudentInfo'
import type { CompletedModule } from '@apptypes/sheetItems'
import {
  LIFrame,
  LITitle,
  LIEmblem,
  LIBottomCorner
} from './ListItemParts/ListItemExports'

const modulePanel = getPanel('MODULES')

const props = defineProps<{
  item: CompletedModule,
}>()

const emblem = computed(() => {
  const grade = props.item.grade
  switch (grade) {
    case 'High Pass':
      return {
        color: 'green',
        text: 'High Pass',
        icon: 'star',
      }
    case 'Pass':
      return {
        color: 'yellow',
        text: 'Pass',
        icon: 'check',
      }
    case 'Low Pass':
      return {
        color: 'orange',
        text: 'Low Pass',
        icon: 'minus',
      }
    case 'Fail':
      return {
        color: 'red',
        text: 'Failed',
        icon: 'close',
      }
    default:
      return {
        color: 'grey',
        text: 'Ungraded',
        icon: 'close',
      }
  }
})

const termValid = computed(() => termValidator(props.item.term))

const student = computed(() => {
  const { studentInfo } = useStudentInfo(props.item.studentSysId)
  return studentInfo.value
})
</script>