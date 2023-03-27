<template>
  <div>
    <div class="d-flex flex-row">
      <div style="font-weight: 900; font-size: 1.5em; line-height: 1">
        {{ item.courseCode || '-' }}
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
        <v-icon 
          class="mr-1"
          style="opacity: 0.75"
        >
          mdi-calendar
        </v-icon>
        <p>
          {{ item.term || '(No Term)' }} 
        </p>
        <v-spacer></v-spacer>
        <p>
          {{ item.studentId || '(No Student ID)' }}
        </p>
        <v-icon 
          class="ml-1"
          style="opacity: 0.75"
        >
          mdi-card-account-details
        </v-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CompletedModule } from '../SheetTypes'

const props = defineProps<{
  item: CompletedModule
}>()
</script>