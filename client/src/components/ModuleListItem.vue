<template>
  <div>
    <div style="font-weight: 900; font-size: 1.25em;">
      {{ item.courseCode || '(No Course Code)' }}
    </div>
    <div style="font-size: 0.9em;">
      {{ item.studentId || '(No Student ID)' }} - 
      {{ item.description || '(No Description)' }} - 
      {{ item.term || '(No Term)' }}
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>