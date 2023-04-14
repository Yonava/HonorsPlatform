<template>
  <div>
    <LockArea 
      v-if="!id"
      title="Module Tracking"
      condition="student ID"
    />
    <div v-else>
      <div class="d-flex flex-row align-center">
        <h2>
          Modules In Progress:
        </h2>
        <v-spacer></v-spacer>
        <v-btn
          @click="showAddModal = true"
          size="small"
          color="green"
        >
          <v-icon class="mr-1">mdi-plus</v-icon>
          Add Module
        </v-btn>
      </div>
      <div
        v-if="loading"
        class="d-flex flex-row justify-center"
      >
        <v-progress-circular
          indeterminate
          class="mt-3"
          color="blue-darken-2"
        ></v-progress-circular>
      </div>
      <div
        v-else-if="modules.length === 0"
        style="font-weight: 200; color: red; font-size: 25px"
      >
        No modules in progress.
      </div>
      <div
        v-else
        style="max-height: 500px; overflow: auto"
      >
        <ModuleList
          @selected="i => openModal(i)"
          @delete="deleteModule($event)"
          :modules="modules"
        />
      </div>
      <ModuleDetailModal 
        @close="closeModal"
        @update="updateModule($event)"
        :module="selectedModule"
        :show="showModal"
      />
      <AddModal 
        @close="showAddModal = false"
        @success="fetch"
        :show="showAddModal"
        :panel="switchPanel(PanelType.MODULES)"
        :override="{
          color: 'blue',
          predefineColumnData: [id],
        }"
      />
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ModuleList from './ModuleList.vue'
import AddModal from './AddModal.vue'
import LockArea from './LockArea.vue'
import { Module } from '../SheetTypes'
import { PanelType, switchPanel } from '../SwitchPanel'
import ModuleDetailModal from './ModuleDetailModal.vue'
import { mapModules, unmapModules } from '../DataMappers'
import { 
  getEvery, 
  clearByRow, 
  postInRange, 
  Range, 
  updateByRow 
} from '../SheetsAPI'

const props = defineProps<{
  id: string | undefined
}>()

const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

const emits = defineEmits([
  'update', 
  'loading-state'
])
const loading = ref(true)
const modules = ref<Module[]>([])
const selectedModule = ref<Module | undefined>(undefined)
const showModal = ref(false)
const showAddModal = ref(false)

watch(loading, (val) => {
  emits('loading-state', val)
})

watch(() => props.id , async () => {
  await fetch()
}, { immediate: true })

async function fetch() {
  loading.value = true
  modules.value = []
  const events = await getEvery(Range.MODULES)
  modules.value = mapModules(events).filter(e => e.studentId === props.id)
  emits('update', modules.value)
  loading.value = false
}

async function updateModule(event: Module) {
  loading.value = true
  closeModal()
  if (event) {
    await updateByRow(Range.MODULES, event.row, unmapModules([event]))
  }
  await fetch()
}

async function deleteModule(event: Module) {
  loading.value = true
  await clearByRow(Range.MODULES, event.row)
  await fetch()
}

function openModal(selected: Module) {
  selectedModule.value = selected
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedModule.value = undefined
}
</script>