<template>
  <LIFrame :item="item">

    <template #left>

      <LIIcon
        v-if="overOneYearInProgress"
        icon="alert"
        color="red"
        tooltip="DocuSign Created Over A Year Ago"
      />

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
        :color="docuSignStatus.color"
        :text="docuSignStatus.text"
        :tooltip="docuSignStatus.tooltip"
        :icon="docuSignStatus.icon"
      />

    </template>

    <template #corners>
      <LIBottomCorner
        :left="{
          icon: 'human-male-board',
          text: item.instructor || '(No Instructor)',
          tooltip: 'Instructor',
        }"
        :right="student"
      />
    </template>

  </LIFrame>

</template>

<script setup lang="ts">
import { computed } from 'vue'
import { termValidator } from '@utils/terms'
import { daysSinceDate } from '@utils/dates'
import type { Module } from '@apptypes/sheetItems'
import { useStudentInfo } from '@composables/useStudentInfo'
import {
  LIFrame,
  LIIcon,
  LITitle,
  LIEmblem,
  LIBottomCorner
} from './ListItemParts/ListItemExports'

const props = defineProps<{
  item: Module,
}>()

const overOneYearInProgress = computed(() => {

  if (!props.item.docuSignCreated.trim()) {
    return false
  }

  const now = new Date()
  try {
    const created = new Date(props.item.docuSignCreated)
    const diff = now.getTime() - created.getTime()
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return diffDays > 365
  } catch (e) {
    console.warn(e)
    return false
  }
})

const docuSignStatus = computed(() => {
  const created = new Date(props.item.docuSignCreated)
  const completed = new Date(props.item.docuSignCompleted)
  const invalid =
    (created.toString() === 'Invalid Date' && props.item.docuSignCreated) ||
    (completed.toString() === 'Invalid Date' && props.item.docuSignCompleted)

  if (invalid) {
    return {
      icon: 'file-document-alert-outline',
      text: 'Invalid Date',
      color: 'red',
      tooltip: 'Either the created or completed date for the DocuSign is invalid.'
    } as const
  } else if (props.item.docuSignCompleted) {
    return {
      icon: 'file-document-check-outline',
      text: 'Completed',
      color: 'green',
      tooltip: `DocuSign Completed ${daysSinceDate(props.item.docuSignCompleted)} (${props.item.docuSignCompleted})`
    } as const
  } else if (props.item.docuSignCreated) {
    return {
      icon: 'file-document-outline',
      text: 'In Progress',
      color: 'blue',
      tooltip: `DocuSign Created ${daysSinceDate(props.item.docuSignCreated)} (${props.item.docuSignCreated})`
    } as const
  } else {
    return {
      icon: 'file-document-alert-outline',
      text: 'Not Started',
      color: 'red',
      tooltip: 'DocuSign Not Started'
    } as const
  }
})

const termValid = computed(() => termValidator(props.item.term))

const student = computed(() => {
  const { studentInfo } = useStudentInfo(props.item.studentSysId)
  return studentInfo.value
})
</script>