<template>
  <div>
    <div class="d-flex flex-row">
      <div style="font-weight: 900; font-size: 1.5em; line-height: 1">
        {{ item.courseCode || '-' }}
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
        <div class="d-flex flex-row align-center">
          <v-icon 
            class="mr-1"
            style="opacity: 0.75"
          >
            mdi-calendar
          </v-icon>
          <p :style="termStyle">
            {{ item.term || '(No Term)' }} 
          </p>
          <v-tooltip
            :disabled="smAndDown"
            activator="parent"
            location="bottom"
          >{{ termTooltip }}</v-tooltip>
        </div>
        <v-spacer></v-spacer>
        <div class="d-flex flex-row align-center">
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
            :disabled="smAndDown"
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
import { useDisplay } from 'vuetify'
import { CompletedModule } from '../../SheetTypes'
import { termValidator } from '../../TermValidator'

const props = defineProps<{
  item: CompletedModule
}>()

const { smAndDown } = useDisplay()

const termStyle = computed(() => {
  if (termValidator(props.item.term)) {
    return {}
  } else {
    return {
      color: 'red',
      fontWeight: 900
    }
  }
})

const termTooltip = computed(() => {
  if (termValidator(props.item.term)) {
    return 'Term'
  } else {
    return 'Term (Potentially Invalid)'
  }
})
</script>