<template>
  <div>
    <LockArea 
      v-if="!id"
      title="Engagement Tracking"
      condition="grad ID"
    />
    <div v-else>
      <div class="d-flex flex-row justify-space-between align-center">
        <h1 class="mb-2">
          Engagement Tracking
        </h1>
        <v-btn 
          @click="openModal" 
          color="green" 
          size="small"
        >
          <v-icon 
          class="mr-2" 
          size="x-large"
        >mdi-plus</v-icon>
          Add Event
        </v-btn>
      </div>
      <EngagementView 
        v-if="!loading"
        @selected="selectedEngagement = $event"
        @update="updateEngagement"
        @delete="deleteEngagement"
        :engagements="engagements"
      />
      <div
        v-if="loading"
        class="d-flex flex-row justify-center"
      >
        <v-progress-circular
          indeterminate
          color="purple-darken-2"
        ></v-progress-circular>
      </div>
      <div
        v-else-if="engagements.length === 0"
        style="font-weight: 200; color: red; font-size: 25px"
      >
        No events yet.
      </div>
      <GradEngagementModal 
        @close="closeModal"
        @add="addEngagementEvent($event)"
        @update="updateEngagementEvent($event)"
        :item="selectedEngagement"
        :show="showModal"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import EngagementView from './EngagementView.vue'
import LockArea from './LockArea.vue'
import { GradEngagement } from '../SheetTypes'
import GradEngagementModal from './GradEngagementModal.vue'
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
const selectedEngagement = ref<GradEngagement | undefined>(undefined)
const showModal = ref(false)

watch(() => props.id , async () => {
  await fetchEngagements()
}, { immediate: true })

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

function openModal() {
  selectedEngagement.value = undefined
  showModal.value = true
}

function closeModal() {
  selectedEngagement.value = undefined
  showModal.value = false
}
</script>