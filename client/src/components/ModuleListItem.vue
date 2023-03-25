<template>
  <div>
    <div class="d-flex flex-row">
      <div style="font-weight: 900; font-size: 1.5em; line-height: 1">
        {{ item.courseCode || '(No Course Code)' }}
        <span style="font-weight: 300; font-size: 0.6em">
          {{ item.term || '(No Term)' }}
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
          mdi-human-male-board
        </v-icon>
        <p>
          {{ item.instructor || '(No Instructor)' }} 
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

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const docuSignStatus = computed(() => {
  if (props.item.docuSignCreated && props.item.docuSignCompleted) {
    return {
      icon: 'mdi-file-document-check-outline',
      text: 'Completed',
      color: 'green'
    }
  } else if (props.item.docuSignCreated) {
    return {
      icon: 'mdi-file-document-outline',
      text: 'In Progress',
      color: 'blue'
    }
  } else if (!(props.item.docuSignCompleted || props.item.docuSignCreated)) {
    return {
      icon: 'mdi-file-document-alert-outline',
      text: 'Not Started',
      color: 'red'
    }
  } else {
    return {
      icon: 'mdi-file-document-remove-outline',
      text: 'Missing Start Date',
      color: 'purple'
    }
  }
})
</script>