<template>
  <div>
    <div class="d-flex flex-row">
      <div style="font-weight: 900; font-size: 1.5em; line-height: 1">
        {{ item.name || '(No Name)' }}
        <span style="font-weight: 300; font-size: 0.6em">
          {{ item.studentId || '(No ID)' }}
          <v-tooltip
            :disabled="smAndDown"
            activator="parent"
            location="bottom"
          >Student ID</v-tooltip>
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
        }"
        class="px-2 py-1 d-flex flex-row align-center"
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
import { Thesis, ThesisDecision } from '../SheetTypes'
import { termValidator } from '../TermValidator'
import { useDisplay } from 'vuetify'

const props = defineProps<{
  item: Thesis
}>()

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
  if (decision === ThesisDecision.APPROVED) {
    return {
      color: 'green',
      icon: 'mdi-check',
      text: 'Approved'
    }
  } else if (decision === ThesisDecision.REJECTED) {
    return {
      color: 'red',
      icon: 'mdi-close',
      text: 'Rejected'
    }
  } else if (decision === ThesisDecision.PENDING) {
    return {
      color: 'grey',
      icon: 'mdi-minus',
      text: 'Pending'
    }
  } else {
    console.warn('Unknown decision: ' + decision)
    return {
      color: 'grey',
      icon: 'mdi-minus',
      text: 'No Decision'
    }
  }
})
</script>