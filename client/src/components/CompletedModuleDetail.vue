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
          :color="upToDate ? 'green' : 'red-darken-2'"
          :style="{
            cursor: upToDate ? 'default' : 'pointer',
          }"
          rounded
          class="ml-7"
        >{{ upToDate ? 'All Synced Up!' : 'Update Module' }}</v-btn>
      </div>
      <v-divider class="my-2"></v-divider>
      <v-text-field
        v-model="module.completedDate"
        label="Completed Date"
      >
        <template #prepend>
          <v-icon>mdi-check</v-icon>
        </template>
      </v-text-field>
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
      <div class="d-flex flex-column align-center justify-center">
        <h2>
          Final Grade
        </h2>
        <input 
          v-model="module.grade"
          type="text" 
          class="header-input" 
          placeholder="Grade"
          style="font-size: 5em; text-align: center;"
        >
      </div>
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
  defineProps, 
  defineEmits, 
  watch, 
  computed,
  toRefs, 
  onMounted,
  onUnmounted
} from 'vue'
import { CompletedModule } from '../SheetTypes'
import { updateByRow, Range } from '../SheetsAPI'
import { useAutoSync, useChangeWatcher } from '../AutoSync'
import { unmapCompletedModules } from '../DataMappers'

const props = defineProps<{
  item: CompletedModule,
  autoSync: boolean
}>()

const emits = defineEmits([
  'delete', 
  'update', 
  'unselect'
])

const clone = <T>(obj: T) => JSON.parse(JSON.stringify(obj))

const updating = ref(false)
const module = ref<CompletedModule>(clone(props.item))

watch(() => props.item, (newVal) => {
  module.value = clone(newVal)
})

const { autoSync } = toRefs(props)
useAutoSync(autoSync, reqUpdateModule)
const { upToDate } = useChangeWatcher(module)

async function reqUpdateModule() {
  if (upToDate.value) return
  updating.value = true
  await updateByRow(
    Range.COMPLETED_MODULES, 
    module.value.row, 
    unmapCompletedModules([module.value])
  )
  emits('update', clone(module.value))
  upToDate.value = true
  updating.value = false
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