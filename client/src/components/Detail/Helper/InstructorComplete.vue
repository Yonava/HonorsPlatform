<template>
  <v-btn
    v-if="instructor !== suggestedInstructor"
    @click="emits('update', suggestedInstructor)"
    :disabled="!suggestedInstructor"
    :color="color"
    size="x-small"
    class="mb-2"
  >
    {{ buttonText }}
  </v-btn>
</template>

<script setup lang="ts">
import { useInstructorAutoComplete } from '../../../InstructorAutoComplete'
import { computed, toRefs } from 'vue'

const props = defineProps<{
  color?: string,
  instructor: string | null,
}>()

const { instructor } = toRefs(props)

const emits = defineEmits<{
  (e: 'update', v: string | false): () => string
}>()

const buttonText = computed(() => {
  return suggestedInstructor.value || 'No Suggestions'
})

const { suggestedInstructor } = useInstructorAutoComplete(instructor)

const color = computed(() => {
  return props.color || 'blue-darken-2'
})
</script>