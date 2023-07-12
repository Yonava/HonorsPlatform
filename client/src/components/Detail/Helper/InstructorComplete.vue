<template>
  <v-btn
    v-if="instructor !== instructorSuggestion"
    @click="emits('update', instructorSuggestion)"
    :disabled="!instructorSuggestion"
    :color="color"
    size="x-small"
    class="mb-2"
  >
    {{ buttonText }}
  </v-btn>
</template>

<script setup lang="ts">
import { useInstructorAutoComplete } from '../../../InstructorAutoComplete'
import { computed, watch } from 'vue'

const props = defineProps<{
  color?: string,
  instructor: string | null,
}>()

const emits = defineEmits<{
  update: () => string
}>()

const buttonText = computed(() => {
  return instructorSuggestion.value || 'No Suggestions'
})

const {
  getSuggestedInstructor,
  init: reComputeInstructors
} = useInstructorAutoComplete()

const instructorSuggestion = computed(() => {
  return getSuggestedInstructor(props.instructor || '')
})

watch(() => props.instructor, (newInput, oldInput) => {
  const newLength = newInput?.length || 0
  const oldLength = oldInput?.length || 0
  const distance = Math.abs(newLength - oldLength)
  if (distance > 1) {
    reComputeInstructors()
  }
})

const color = computed(() => {
  return props.color || 'blue-darken-2'
})
</script>