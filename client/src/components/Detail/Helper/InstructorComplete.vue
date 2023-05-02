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
import { instructorAutoComplete } from '../../../InstructorAutoComplete'
import { computed } from 'vue'

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

const instructorSuggestion = computed(() => {
  return instructorAutoComplete(props.instructor)
})

const color = computed(() => {
  return props.color || 'blue-darken-2'
})
</script>