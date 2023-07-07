<template>
  <div>
    <div class="d-flex flex-row">
      <div style="font-weight: 900; font-size: 1.5em; line-height: 1">
        {{ item.courseCode || '(No Course Code)' }}
        <v-tooltip
          :disabled="smAndDown"
          activator="parent"
          location="bottom"
        >Course Code</v-tooltip>
      </div>
      <v-spacer></v-spacer>
      <v-sheet
        class="px-3 py-1 d-flex flex-row align-center"
        :color="item.completedDate ? 'green' : 'red'"
        elevation="1"
        :style="{
          height: '25px',
          color: 'white',
          borderRadius: '25px',
          whiteSpace: 'nowrap',
          textTransform: 'capitalize',
        }"
      >
        <v-icon class="mr-1">{{ item.completedDate ? 'mdi-check' : 'mdi-close' }}</v-icon>
        <span>{{ item.completedDate ? `Completed ${item.completedDate}` : 'No Completion Date' }}</span>
      </v-sheet>
    </div>
    <div
      class="d-flex flex-column mt-5"
      style="font-size: 0.9em;"
    >
      <div class="d-flex flex-row">
        <div
          :style="term.style"
          class="d-flex flex-row align-center"
        >
          <v-icon
            class="mr-1"
            style="opacity: 0.75"
          >
            mdi-calendar
          </v-icon>
          <p>
            {{ item.term || '(No Term)' }}
          </p>
          <v-tooltip
            :disabled="smAndDown"
            activator="parent"
            location="bottom"
          >{{ term.tooltip }}</v-tooltip>
        </div>
        <v-spacer></v-spacer>
        <div
          class="d-flex flew-row align-center"
          :style="studentMatch.style"
        >
          <p>
            {{ studentMatch.text }}
          </p>
          <v-icon
            class="ml-1"
            style="opacity: 0.75"
          >
            {{ studentMatch.icon }}
          </v-icon>
          <v-tooltip
            :disabled="smAndDown"
            activator="parent"
            location="bottom"
          >{{ studentMatch.tooltip }}</v-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStudentMatcher } from './useStudentMatcher'
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { CompletedModule } from '../../SheetTypes'
import { termValidator } from '../../TermValidator'

const props = defineProps<{
  item: CompletedModule
}>()

const { smAndDown } = useDisplay()

const term = computed(() => {
  if (termValidator(props.item.term)) {
    return {
      tooltip: 'Term'
    }
  } else {
    return {
      tooltip: 'Term (Potentially Invalid)',
      style: {
        color: 'red',
        fontWeight: 900
      }
    }
  }
})

const { studentMatch } = useStudentMatcher(props.item.studentId)
</script>