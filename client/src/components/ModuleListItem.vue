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
          activator="parent"
          location="bottom"
        >{{ item.courseCode + ' In Progress For Over 1 Year' }}</v-tooltip>
      </div>
      <div style="font-weight: 900; font-size: 1.5em; line-height: 1.25">
        <span>
          {{ item.courseCode || '(No Course)' }}
          <v-tooltip
            activator="parent"
            location="bottom"
          >Course Code</v-tooltip>
        </span>
        <span :style="termStyle">
          {{ item.term || '(No Term)' }}
          <v-tooltip
            activator="parent"
            location="bottom"
          >{{ termTooltip }}</v-tooltip>
        </span>
      </div>
      <v-spacer></v-spacer>
      <v-sheet 
        class="px-3 py-1 d-flex flex-row align-center"
        :color="docuSignStatus.color"
        elevation="1"
        :style="{
          height: '25px',
          color: 'white',
          borderRadius: '25px',
          whiteSpace: 'nowrap',
          textTransform: 'capitalize',
        }"
      >
        <v-icon class="mr-1">{{ docuSignStatus.icon }}</v-icon>
        <span>{{ docuSignStatus.text }}</span>
        <v-tooltip
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
            activator="parent"
            location="bottom"
          >Instructor</v-tooltip>
        </div>
        <v-spacer></v-spacer>
        <div class="d-flex flew-row align-center">
          <p>
            {{ item.studentId || '(No Student ID)' }}
          </p>
          <v-icon 
            class="ml-1"
            style="opacity: 0.75"
          >
            mdi-card-account-details
          </v-icon>
          <v-tooltip
            activator="parent"
            location="bottom"
          >Student ID</v-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Module } from '../SheetTypes'
import type { ComputedRef } from 'vue'
import { termValidator } from '../TermValidator'

const props = defineProps<{
  item: Module
}>()

type DocuSignStatus = {
  icon: string,
  text: string,
  color: string
}

const overOneYearInProgress = computed(() => {
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
    if (diffDays === 1) {
      return 'Today'
    } else if (diffDays === 2) {
      return 'Yesterday'
    } else if (diffDays < 0){
      return `${diffDays * -1} Days In The Future... Woah!`
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
      tooltip: `DocuSign Completed (${props.item.docuSignCompleted})`
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

const termTooltip = computed(() => {
  if (termValidator(props.item.term)) {
    return 'Term'
  } else {
    return `Term (Potentially Invalid)`
  }
})

const termStyle = computed(() => {
  if (termValidator(props.item.term)) {
    return {
      'font-weight': '300',
      'font-size': '0.6em',
      'color': 'black'
    }
  } else {
    return {
      'font-weight': '900',
      'font-size': '0.6em',
      'color': 'red'
    }
  }
})
</script>