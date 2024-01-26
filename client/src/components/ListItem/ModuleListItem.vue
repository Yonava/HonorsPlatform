<template>
  <LIFrame
    :item="item"
    :styled="styled"
    :bottom-corners="[
      {
        icon: 'human-male-board',
        text: item.instructor || '(No Instructor)',
        tooltip: 'Instructor',
      },
      student
    ]"
  >

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

  </LIFrame>

</template>

<script setup lang="ts">
import { computed } from 'vue'
import { termValidator } from '@utils/TermValidator'
import { Module } from '@apptypes/sheetItems'
import { useStudentInfo } from './useStudentInfo'
import {
  LIFrame,
  LIIcon,
  LITitle,
  LIEmblem,
} from './ListItemParts/ListItemExports'

const props = defineProps<{
  item: Module,
  styled: boolean
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

const daysSinceDate = (date: string) => {
  const now = new Date()
  try {
    const created = new Date(date)
    const diff = now.getTime() - created.getTime()
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (isNaN(diffDays)) {
      return 'On A Date That Is Not Valid 🫣'
    } else if (diffDays === 1) {
      return 'Today'
    } else if (diffDays === 2) {
      return 'Yesterday'
    } else if (diffDays === 0) {
      return 'Tomorrow 😱'
    } else if (diffDays < 0) {
      return `${Math.abs(diffDays) + 1} Days In The Future... 🤯`
    } else {
      return `${diffDays - 1} Days Ago`
    }
  } catch (e) {
    console.warn(e)
    return 0
  }
}

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
    }
  } else if (props.item.docuSignCompleted) {
    return {
      icon: 'file-document-check-outline',
      text: 'Completed',
      color: 'green',
      tooltip: `DocuSign Completed ${daysSinceDate(props.item.docuSignCompleted)} (${props.item.docuSignCompleted})`
    }
  } else if (props.item.docuSignCreated) {
    return {
      icon: 'file-document-outline',
      text: 'In Progress',
      color: 'blue',
      tooltip: `DocuSign Created ${daysSinceDate(props.item.docuSignCreated)} (${props.item.docuSignCreated})`
    }
  } else {
    return {
      icon: 'file-document-alert-outline',
      text: 'Not Started',
      color: 'red',
      tooltip: 'DocuSign Not Started'
    }
  }
})

const termValid = computed(() => termValidator(props.item.term))

const student = computed(() => {
  const { studentInfo } = useStudentInfo(props.item.studentSysId)
  return studentInfo.value
})
</script>