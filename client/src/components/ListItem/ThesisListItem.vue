<template>
  <div>
    <div class="d-flex flex-row">
      <div
        class="d-flex flex-row align-baseline flex-wrap"
        style="font-weight: 900; font-size: 1.5em; line-height: 1; gap: 6px;"
      >
        {{ item.title || '(No Title)' }}
        <span
          style="font-weight: 300; font-size: 0.6em"
        >
          <div
            :style="studentInfo.style"
            class="d-flex flew-row align-center"
          >
            <v-icon
              class="mr-1"
              style="opacity: 0.75"
            >
              {{ studentInfo.icon }}
            </v-icon>
            <p>
              {{ studentInfo.text }}
            </p>
            <v-tooltip
              :disabled="smAndDown"
              activator="parent"
              location="bottom"
            >{{ studentInfo.tooltip }}</v-tooltip>
          </div>
        </span>
      </div>
      <v-spacer></v-spacer>
      <v-sheet
        :color="decisionStatus.color"
        :style="{
          height: '25px',
          color: 'white',
          borderRadius: '25px',
          textTransform: 'capitalize',
          whiteSpace: 'nowrap',
        }"
        class="px-2 py-1 d-flex flex-row align-center ml-1"
        elevation="1"
      >
        <v-icon class="mr-1">
          {{ decisionStatus.icon }}
        </v-icon>
        <span>
          {{ decisionStatus.text }}
        </span>
        <v-tooltip
          :disabled="smAndDown"
          activator="parent"
          location="bottom"
        >Thesis Proposal {{ decisionStatus.text }}</v-tooltip>
      </v-sheet>
    </div>
    <div
      class="d-flex flex-column mt-5"
      style="font-size: 0.9em;"
    >
      <div class="d-flex flex-row">
        <div class="d-flex flex-row align-center">
          <v-icon
            class="mr-1"
            style="opacity: 0.75"
          >
            mdi-human-male-board
          </v-icon>
          <p>
            {{ item.mentor || '(No Mentor)' }}
          </p>
          <v-tooltip
            :disabled="smAndDown"
            activator="parent"
            location="bottom"
          >Faculty Mentor</v-tooltip>
        </div>
        <v-spacer></v-spacer>
        <div class="d-flex flex-row align-center">
          <span :style="termStyle">
            {{ item.term || '(No Term)' }}
            <v-tooltip
              :disabled="smAndDown"
              activator="parent"
              location="bottom"
            >{{ termTooltip }}</v-tooltip>
          </span>
          <v-icon
            class="ml-1"
            style="opacity: 0.75"
          >
            mdi-calendar
          </v-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Thesis } from '../../SheetTypes'
import { termValidator } from '../../TermValidator'
import { useDisplay } from 'vuetify'
import { useStudentInfo } from './useStudentInfo'

const props = defineProps<{
  item: Thesis
}>()

const { smAndDown } = useDisplay()

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
      'color': 'black'
    }
  } else {
    return {
      'font-weight': '900',
      'color': 'red'
    }
  }
})

const decisionStatus = computed(() => {
  const decision = props.item.decision
  if (decision === 'Approved') {
    return {
      color: 'green',
      icon: 'mdi-check',
      text: 'Approved'
    }
  } else if (decision === 'Rejected') {
    return {
      color: 'red',
      icon: 'mdi-close',
      text: 'Rejected'
    }
  } else if (decision === 'Pending') {
    return {
      color: 'grey',
      icon: 'mdi-minus',
      text: 'Pending'
    }
  } else {
    return {
      color: 'grey',
      icon: 'mdi-minus',
      text: 'No Decision'
    }
  }
})

const { studentInfo } = useStudentInfo(props.item.studentSysId)
</script>