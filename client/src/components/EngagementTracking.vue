<template>
  <div>
    <EngagementView 
      @add="addEngagement"
      @update="updateEngagement"
      @delete="deleteEngagement"
      :engagements="engagements"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import EngagementView from './EngagementView.vue'
import { GradEngagement } from '../SheetTypes'
import { mapGradEngagement, unmapGradEngagement } from '../DataMappers'
import { 
  getEvery, 
  clearByRow, 
  postInRange, 
  Range, 
  updateByRow 
} from '../SheetsAPI'

const props = defineProps<{
  id: string
}>()

const emits = defineEmits(['update'])
const loading = ref(true)
const engagements = ref<GradEngagement[]>([])

async function fetchEngagements() {
  loading.value = true
  engagements.value = []
  const events = await getEvery(Range.GRAD_ENGAGEMENT)
  engagements.value = mapGradEngagement(events).filter(e => e.gradId === props.id)
  loading.value = false
}

async function addEngagementEvent(event: GradEngagement) {
  event.gradId = props.id
  await postInRange(Range.GRAD_ENGAGEMENT, unmapGradEngagement([event]))
  await fetchEngagements()
}

async function updateEngagementEvent(event: GradEngagement) {
  await updateByRow(Range.GRAD_ENGAGEMENT, event.row, unmapGradEngagement([event]))
  await fetchEngagements()
}

async function deleteEngagementEvent(event: GradEngagement) {
  await clearByRow(Range.GRAD_ENGAGEMENT, event.row)
  await fetchEngagements()
}
</script>