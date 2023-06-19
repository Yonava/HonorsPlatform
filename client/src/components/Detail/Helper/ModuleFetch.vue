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
          @click="addNewModule"
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
        v-else-if="displayedModules.length === 0"
        style="font-weight: 200; color: red; font-size: 25px"
      >
        No modules in progress.
      </div>
      <div
        v-else
        style="max-height: 300px; overflow: auto"
      >
        <ModuleList
          @selected="i => openModal(i)"
          @delete="deleteModule($event)"
          :modules="displayedModules"
        />
      </div>
      <ModuleDetailModal
        @close="closeModal"
        @update="updateModule($event)"
        :module="selectedModule"
        :show="showModal"
      />
    </div>
  </div>

</template>

<script setup lang="ts">
import ModuleList from './ModuleList.vue'
import LockArea from './LockArea.vue'
import ModuleDetailModal from './ModuleDetailModal.vue'
import { ref, computed, watch, toRefs, onMounted } from 'vue'
import { Module } from '../../../SheetTypes'
import { panels } from '../../../Panels'
import { useSheetManager } from '../../../store/useSheetManager'
import { useDocumentCache } from '../../../store/useDocumentCache'
import { mapModules, unmapModules } from '../../../DataMappers'
import {
  getEvery,
  clearByRow,
  postInRange,
  updateByRow
} from '../../../SheetsAPI'

const { newSysId } = useSheetManager()
const documents = useDocumentCache()
const { refreshCache, deleteItem, addItemToCache, updateItem, Modules } = documents
const { list: modules } = toRefs(Modules)
const modulePanel = panels['MODULES']

const loading = ref(true)
onMounted(async () => {
  const cachedModules = documents[modulePanel.sheetRange].list
  if (cachedModules.length === 0) {
    await refreshCache(modulePanel)
  }
  loading.value = false
})

const props = defineProps<{
  id: string | undefined
}>()

const showModal = ref(false)
const selectedModule = ref<Module | undefined>(undefined)

const displayedModules = computed(() => {
  if (!props.id) return []
  return modules.value.filter(e => e.studentId === props.id)
})

async function updateModule(newModule: Module) {
  closeModal()
  await updateItem(newModule, modulePanel)
}

async function deleteModule(module: Module) {
  await deleteItem(module, modulePanel)
}

function openModal(selected: Module) {
  selectedModule.value = selected
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedModule.value = undefined
}

async function addNewModule() {
  const [newItem] = await modulePanel.mappers.map([
    [
      newSysId(),
      props.id,
    ]
  ]);
  newItem.row = null;

  selectedModule.value = newItem
  showModal.value = true
}
</script>