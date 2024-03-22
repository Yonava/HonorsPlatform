<template>
  <LIFrame :item="item">

    <template #left>

      <LITitle
        :primary="{
          text: item.title || '(No Title)',
        }"
        :secondary="{
          text: item.term || '(No Term)',
          tooltip: termTooltip,
          error: !termValid
        }"
      />

    </template>

    <template #right>

      <LIEmblem
        :color="decisionStatus.color"
        :text="decisionStatus.text"
        :icon="decisionStatus.icon"
        :tooltip="decisionStatus.tooltip"
      />

    </template>

    <template #corners>
      <LIBottomCorner
        :left="{
          text: item.mentor || '(No Mentor)',
          icon: 'human-male-board',
          tooltip: 'Faculty Mentor',
        }"
        :right="student"
      />
    </template>

  </LIFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { termValidator } from '@utils/terms'
import type { Thesis } from '@apptypes/sheetItems'
import { useStudentInfo } from '@composables/useStudentInfo'
import {
  LIFrame,
  LITitle,
  LIEmblem,
  LIBottomCorner
} from './ListItemParts/ListItemExports'

const props = defineProps<{
  item: Thesis,
}>()

const termValid = computed(() => termValidator(props.item.term))

const termTooltip = computed(() => {
  const text = 'Term'
  return termValid.value ? text : `${text} (Potentially Invalid)`
})

const decisionStatus = computed(() => {
  const decision = props.item.decision
  if (decision === 'Approved') {
    return {
      color: 'green',
      icon: 'check',
      text: 'Approved',
      tooltip: 'Approved By Honors Committee'
    }
  } else if (decision === 'Rejected') {
    return {
      color: 'red',
      icon: 'close',
      text: 'Rejected',
      tooltip: 'Rejected By Honors Committee'
    }
  } else if (decision === 'Pending') {
    return {
      color: 'grey',
      icon: 'minus',
      text: 'Pending',
      tooltip: 'Pending Approval By Honors Committee'
    }
  } else {
    return {
      color: 'grey',
      icon: 'minus',
      text: 'No Decision',
      tooltip: 'Honors Committee Approval Decision Not Recorded'
    }
  }
})

const student = computed(() => {
  const { studentInfo } = useStudentInfo(props.item.studentSysId)
  return studentInfo.value
})
</script>