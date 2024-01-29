
<template>
  <LIFrame
    :item="item"
    :styled="styled"
    :bottomCorners="[
      student,
      {
        prop: 'mentor',
        text: item.mentor || '(No Mentor)',
        icon: 'human-male-board',
        tooltip: 'Faculty Mentor',
      }
    ]"
  >

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

  </LIFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { termValidator } from '@utils/terms'
import type { Thesis } from '@apptypes/sheetItems'
import { useStudentInfo } from './useStudentInfo'
import {
  LIFrame,
  LITitle,
  LIEmblem,
} from './ListItemParts/ListItemExports'

const props = defineProps<{
  item: Thesis,
  styled?: boolean
}>()

const termValid = computed(() => termValidator(props.item.term))

const termTooltip = computed(() => {
  return 'Term' + termValid.value ? '' : ' (Potentially Invalid)'
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
      tooltip: 'Honors Committee Approval Decision Not In System'
    }
  }
})

const student = computed(() => {
  const { studentInfo } = useStudentInfo(props.item.studentSysId)
  return studentInfo.value
})
</script>