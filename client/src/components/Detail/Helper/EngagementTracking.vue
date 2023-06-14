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
          @click="openModal(getNewEngagement())"
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
      <div
        v-else
        style="max-height: 500px; overflow: auto"
      >
        <EngagementView
          @selected="i => openModal(i)"
          @delete="deleteEngagementEvent($event)"
          :engagements="engagements"
        />
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
import { GradEngagement } from '../../../SheetTypes'
import GradEngagementModal from './GradEngagementModal.vue'
import { mapGradEngagements, unmapGradEngagements } from '../../../DataMappers'
import {
  getEvery,
  clearByRow,
  postInRange,
  updateByRow
} from '../../../SheetsAPI'
import { useSheetManager } from '../../../store/useSheetManager'

const props = defineProps<{
  id: string | undefined
}>()

const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

const emits = defineEmits([
  'update',
  'loading-state'
])
const loading = ref(true)
const engagements = ref<GradEngagement[]>([])
const selectedEngagement = ref<GradEngagement | undefined>(undefined)
const showModal = ref(false)

watch(loading, (val) => {
  emits('loading-state', val)
})

watch(() => props.id , async () => {
  await fetchEngagements()
}, { immediate: true })

async function fetchEngagements() {
  loading.value = true
  engagements.value = []
  const events = await getEvery('Grad Engagements')
  engagements.value = mapGradEngagements(events).filter(e => e.gradId === props.id)
  emits('update', engagements.value)
  loading.value = false
}

async function addEngagementEvent(event: GradEngagement) {
  event.gradId = props.id
  loading.value = true
  await postInRange('Grad Engagements', unmapGradEngagements([event]))
  await fetchEngagements()
}

async function updateEngagementEvent(event: GradEngagement) {
  loading.value = true
  await updateByRow('Grad Engagements', event.row, unmapGradEngagements([event]))
  await fetchEngagements()
}

async function deleteEngagementEvent(event: GradEngagement) {
  loading.value = true
  await clearByRow('Grad Engagements', event.row)
  await fetchEngagements()
}

function openModal(selected: GradEngagement) {
  selectedEngagement.value = selected
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedEngagement.value = undefined
}

function getNewEngagement(): GradEngagement {
  return clone({
    row: 0,
    sysId: useSheetManager().newSysId(),
    gradId: '',
    event: '',
    dateTime: '',
    note: ''
  })
}
</script>