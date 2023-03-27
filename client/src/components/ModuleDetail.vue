<template>
  <div 
    class="d-flex flex-row"
    style="width: 100%; padding: 20px"
  >
    <div style="width: 55%;">
      <p style="font-weight: 200">
        {{ module.studentId }}
      </p>
      <div class="d-flex flex-row align-center">
        <input 
          v-model="module.courseCode"
          placeholder="Course Code"
          type="text" 
          class="header-input"
        >
        <v-spacer></v-spacer>
        <v-btn 
          @click="reqUpdateModule"
          :loading="updating"
          :color="upToDate ? 'green' : 'orange-darken-2'"
          :style="{
            cursor: upToDate ? 'default' : 'pointer',
          }"
          rounded
          class="ml-7"
        >{{ upToDate ? 'All Synced Up!' : 'Update Module' }}</v-btn>
      </div>
      <v-divider class="my-2"></v-divider>
      <v-text-field
        v-model="module.term"
        label="Term"
      >
        <template #prepend>
          <v-icon>mdi-calendar</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="module.instructor"
        label="Instructor"
      >
        <template #prepend>
          <v-icon>mdi-human-male-board</v-icon>
        </template>
      </v-text-field>
      <h1 class="mb-2">
        Documentation
      </h1>
      <div class="d-flex flex-row">
        <v-text-field
          v-model="module.docuSignCreated"
          class="mr-6"
          label="DocuSign Created"
        >
          <template #prepend>
            <v-icon>mdi-calendar-alert</v-icon>
          </template>
        </v-text-field>
        <v-text-field
          v-model="module.docuSignCompleted"
          label="DocuSign Completed"
        >
          <template #prepend>
            <v-icon>mdi-calendar-check</v-icon>
          </template>
        </v-text-field>
      </div>
      <div 
        style="transform: translateY(-15px);"
        class="d-flex flex-row"
      >
        <v-btn
          v-if="!module.docuSignCreated"
          @click="module.docuSignCreated = new Date().toLocaleDateString()"
          color="orange-darken-2"
          size="small"
        >Created Now</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!module.docuSignCompleted"
          @click="module.docuSignCompleted = new Date().toLocaleDateString()"
          color="orange-darken-2"
          size="small"
        >Completed Now</v-btn>
      </div>
      <v-divider class="my-2"></v-divider>
      <v-dialog
        v-model="dialog"
        max-width="500"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="mt-5"
            color="orange-darken-2"
            size="x-large"
            block
          >
            <v-icon 
              class="mr-2"
              size="x-large"
            >mdi-check</v-icon>
            Mark This Module As Completed
          </v-btn>
        </template>
        <v-card
          class="d-flex flex-column align-center pa-3"
        >
          <h1>
            Let's Finish It Up!
          </h1>
          <div 
            v-if="!movingModuleToCompleted"
            style="width: 90%;"
          >
            <div
              class="d-flex flex-row mt-5"
              style="width: 100%;"
            >
              <v-text-field
                v-model="completedModuleData.completedDate"
                label="Date Completed"
                variant="outlined"
                prepend-inner-icon="mdi-calendar"
                class="mx-2"
              ></v-text-field>
              <v-text-field
                v-model="completedModuleData.grade"
                label="Final Grade"
                variant="outlined"
                prepend-inner-icon="mdi-alphabetical"
                class="mx-2"  
              ></v-text-field>
            </div>
            <div style="transform: translateY(-15px)">
              <v-btn
                v-if="!completedModuleData.completedDate"
                @click="completedModuleData.completedDate = new Date().toLocaleDateString()"
                color="orange-darken-2"
                size="small"
                class="ml-2"
              >Completed Today</v-btn>
            </div>
          </div>
          <div 
            v-else
            class="mt-7"
          >
            <v-progress-circular
              indeterminate
              color="orange-darken-2"
            ></v-progress-circular>
          </div>
          <v-card-actions>
            <v-btn
              v-if="!movingModuleToCompleted"
              @click="moveToCompleted"
              color="orange-darken-2"
            >Complete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div 
      style="width: 45%;" 
      class="ml-5 d-flex flex-column"
    >
      <span 
        @click="emits('delete')"
        class="delete d-flex align-center mb-2"
      >
        <v-icon>mdi-delete</v-icon>
        delete module permanently
      </span>
      <v-textarea
        v-model="module.description"
        clearable
        label="Description"
      ></v-textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ref, 
  watch, 
  computed,
  toRefs, 
  onMounted,
  onUnmounted
} from 'vue'
import { updateByRow, moveRowToRange, Range } from '../SheetsAPI'
import { useAutoSync, useChangeWatcher } from '../AutoSync'
import { unmapModules, unmapCompletedModules } from '../DataMappers'
import { Module } from '../SheetTypes'

const props = defineProps<{
  item: Module,
  autoSync: boolean
}>()

const emits = defineEmits([
  'delete', 
  'update',
  'unselect'
])

const clone = <T>(obj: T) => JSON.parse(JSON.stringify(obj))

const updating = ref(false)
const module = ref<Module>(null)
const dialog = ref(false)
const movingModuleToCompleted = ref(false)
const completedModuleData = ref({
  completedDate: '',
  grade: '',
})

watch(() => props.item, (newVal) => {
  module.value = clone(newVal)
}, { immediate: true })

const { autoSync } = toRefs(props)
useAutoSync(autoSync, reqUpdateModule)
const { upToDate } = useChangeWatcher(module)

async function reqUpdateModule() {
  if (upToDate.value) return
  updating.value = true
  await updateByRow(Range.MODULES, module.value.row, unmapModules([module.value]))
  emits('update', clone(module.value))
  upToDate.value = true
  updating.value = false
}

async function moveToCompleted() {
  movingModuleToCompleted.value = true
  await moveRowToRange(
    Range.MODULES, 
    Range.COMPLETED_MODULES, 
    module.value.row, 
    unmapCompletedModules([{
      ...module.value,
      ...completedModuleData.value
    }])
  )
  emits('unselect')
  dialog.value = false
}
</script>

<style scoped>
.delete {
  color: red;
  cursor: pointer;
}

.delete:hover {
  text-decoration: underline;
}

input.header-input {
  font-weight: 900; 
  font-size: 3em; 
  line-height: 0.9; 
  width: 100%;
}

input.header-input:focus {
  outline: none;
}
</style>