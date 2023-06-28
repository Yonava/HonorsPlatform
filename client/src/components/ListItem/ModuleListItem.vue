<template>
  <div>
    <div class="d-flex flex-row">
      <div v-if="overOneYearInProgress && !item.docuSignCompleted">
        <v-icon
          class="mr-2"
          color="red"
        >
          mdi-alert
        </v-icon>
        <v-tooltip
          :disabled="smAndDown"
          activator="parent"
          location="bottom"
        >{{ item.courseCode + ' In Progress For Over 1 Year' }}</v-tooltip>
      </div>
      <div style="font-weight: 900; font-size: 1.5em; line-height: 1.25">
        <span>
          {{ item.courseCode || '(No Course)' }}
          <v-tooltip
            :disabled="smAndDown"
            activator="parent"
            location="bottom"
          >Course Code</v-tooltip>
        </span>
        <span :style="term.style">
          {{ item.term || '(No Term)' }}
          <v-tooltip
            :disabled="smAndDown"
            activator="parent"
            location="bottom"
          >{{ term.tooltip }}</v-tooltip>
        </span>
      </div>
      <v-spacer></v-spacer>
      <v-sheet
        :color="docuSignStatus.color"
        :style="{
          height: '25px',
          color: 'white',
          borderRadius: '25px',
          whiteSpace: 'nowrap',
          textTransform: 'capitalize',
        }"
        class="px-3 py-1 d-flex flex-row align-center"
        elevation="1"
      >
        <v-icon class="mr-1">
          {{ docuSignStatus.icon }}
        </v-icon>
        <span>
          {{ docuSignStatus.text }}
        </span>
        <v-tooltip
          :disabled="smAndDown"
          activator="parent"
          location="bottom"
        >{{ docuSignStatus.tooltip }}</v-tooltip>
      </v-sheet>
    </div>
    <div
      class="d-flex flex-column mt-5"
      style="font-size: 0.9em;"
    >
      <div class="d-flex flex-row">
        <div class="d-flex flew-row align-center">
          <v-icon
            class="mr-1"
            style="opacity: 0.75"
          >
            mdi-human-male-board
          </v-icon>
          <p>
            {{ item.instructor || '(No Instructor)' }}
          </p>
          <v-tooltip
            :disabled="smAndDown"
            activator="parent"
            location="bottom"
          >Instructor</v-tooltip>
        </div>
        <v-spacer></v-spacer>
        <div
          v-if="student"
          class="d-flex flew-row align-center"
        >
          <p>
            {{ student.name || '(No Student Name)' }}
          </p>
          <v-icon
            class="ml-1"
            style="opacity: 0.75"
          >
            mdi-account
          </v-icon>
          <v-tooltip
            :disabled="smAndDown"
            activator="parent"
            location="bottom"
          >Student Name</v-tooltip>
        </div>
        <div
          v-else
          class="d-flex flew-row align-center"
        >
          <p :style="studentId.style">
            {{ item.studentId || '(No Student ID)' }}
          </p>
          <v-icon
            class="ml-1"
            style="opacity: 0.75"
          >
            mdi-card-account-details
          </v-icon>
          <v-tooltip
            :disabled="smAndDown"
            activator="parent"
            location="bottom"
          >{{ studentId.tooltip }}</v-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStudentModuleMatcher } from './ModuleStudentMatch'
import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { Module } from '../../SheetTypes'
import { termValidator } from '../../TermValidator'
import { useDisplay } from 'vuetify'

const props = defineProps<{
  item: Module
}>()

const { smAndDown } = useDisplay()

type DocuSignStatus = {
  icon: string,
  text: string,
  color: string
}

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

const docuSignStatus: ComputedRef<DocuSignStatus> = computed(() => {
  if (props.item.docuSignCreated && props.item.docuSignCompleted) {
    return {
      icon: 'mdi-file-document-check-outline',
      text: 'Completed',
      color: 'green',
      tooltip: `DocuSign Completed ${daysSinceDate(props.item.docuSignCompleted)} (${props.item.docuSignCompleted})`
    }
  } else if (props.item.docuSignCreated) {
    return {
      icon: 'mdi-file-document-outline',
      text: 'In Progress',
      color: 'blue',
      tooltip: `DocuSign Created ${daysSinceDate(props.item.docuSignCreated)} (${props.item.docuSignCreated})`
    }
  } else if (!(props.item.docuSignCompleted || props.item.docuSignCreated)) {
    return {
      icon: 'mdi-file-document-alert-outline',
      text: 'Not Started',
      color: 'red',
      tooltip: 'DocuSign Not Started'
    }
  } else {
    return {
      icon: 'mdi-file-document-remove-outline',
      text: 'Missing Start Date',
      color: 'purple',
      tooltip: 'DocuSign Missing Start Date'
    }
  }
})

const term = computed(() => {
  if (termValidator(props.item.term)) {
    return {
      tooltip: 'Term',
      style: {
        fontSize: '0.6em',
        fontWeight: 400
      }
    }
  } else {
    return {
      tooltip: 'Term (Potentially Invalid)',
      style: {
        color: 'red',
        fontWeight: 900,
        fontSize: '0.6em'
      }
    }
  }
})

const { student, studentId } = useStudentModuleMatcher(props.item)
</script>