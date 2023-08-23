<template>
  <LIFrame
    :item="item"
    :styled="styled"
    :bottom-corners="[
      {
        prop: 'completedDate',
        text: item.completedDate ? `Completed ${item.completedDate}` : 'No Completion Date',
        icon: 'calendar-check',
        tooltip: 'Completion Date',
      },
      student
    ]"
  >
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
  </LIFrame>
</template>

<script setup lang="ts">
import { getPanel } from '../../Panels'
import { useStudentInfo } from './useStudentInfo'
import { computed } from 'vue'
import { CompletedModule } from '../../SheetTypes'
import { termValidator } from '../../TermValidator'
import {
  LIFrame,
  LIIcon,
  LITitle,
  LIEmblem,
} from './ListItemParts/ListItemExports'

const modulePanel = getPanel('MODULES')

const props = defineProps<{
  item: CompletedModule,
  styled: boolean
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

const termValid = computed(() => {
  return termValidator(props.item.term)
})

const student = computed(() => {
  const { studentInfo } = useStudentInfo(props.item.studentSysId)
  return studentInfo.value
})
</script>