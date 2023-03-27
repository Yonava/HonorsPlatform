<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <v-card>
      <h1>Grad Engagement</h1>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { GradEngagement } from '../SheetTypes'

const props = defineProps<{
  item: GradEngagement,
  show: boolean
}>()

const emits = defineEmits(['close'])

const showDialog = computed({
  get: () => props.show,
  set: () => emits('close')
})
</script>