<template>
  <div 
    ref="el"
    :class="[
      'pa-5',
      'd-flex',
      sm ? 'flex-column' : 'flex-row'
    ]"
  >
    <div>
      <p style="font-weight: 200">
        {{ item.studentId }}
      </p>
      <div class="d-flex flex-row align-center">
        <input 
          v-model="item.courseCode"
          placeholder="Course Code"
          type="text" 
          class="header-input"
        >
        <v-spacer></v-spacer>
        <update-button
          @updated="$emit('update', $event)"
          :item="item"
        />
      </div>
      <v-divider class="my-2"></v-divider>
      <v-text-field
        v-model="item.term"
        :rules="[(v) => termValidator(v) || 'Potentially invalid term']"
        label="Term"
      >
        <template #prepend>
          <v-icon>mdi-calendar</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="item.instructor"
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
          v-model="item.docuSignCreated"
          class="mr-6"
          label="DocuSign Created"
        >
          <template #prepend>
            <v-icon>mdi-calendar-alert</v-icon>
          </template>
        </v-text-field>
        <v-text-field
          v-model="item.docuSignCompleted"
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
          v-if="!item.docuSignCreated"
          @click="item.docuSignCreated = new Date().toLocaleDateString()"
          color="orange-darken-2"
          size="small"
        >Created Now</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!item.docuSignCompleted"
          @click="item.docuSignCompleted = new Date().toLocaleDateString()"
          color="orange-darken-2"
          size="small"
        >Completed Now</v-btn>
      </div>
      <FinishModuleModal
        :show="dialog"
        :module="item"
      />
    </div>
    <div 
      :class="[
        sm ? '' : 'ml-5', 
        'd-flex', 
        'flex-column',
        'align-center'
      ]"
      :style="sm ? '' : 'width: 55%'"
    >
      <div style="width: 100%;">
        <v-textarea
          v-model="item.description"
          auto-grow
          variant="outlined"
          clearable
          label="Module description"
        ></v-textarea>
      </div>
      <div
        :class="[
          'd-flex',
          'flex-column'
        ]"
        style="width: 100%"
      >
        <v-btn
          @click="dialog = true"
          color="orange-darken-2"
          size="large"
        >
          <v-icon 
            class="mr-2"
            size="x-large"
          >mdi-check</v-icon>
          Mark Module As Completed
        </v-btn>
        <v-btn 
          @click="$emit('delete')"
          size="large"
          color="red"
          class="mt-3"
        >
          <v-icon
            class="mr-2"
            size="x-large"
          >mdi-delete</v-icon>
          delete module
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRefs } from 'vue'
import { useElementSize } from '@vueuse/core'
import { updateByRow, moveRowToRange, Range } from '../SheetsAPI'
import { unmapModules, unmapCompletedModules } from '../DataMappers'
import { Module, Grade, CompletedModule } from '../SheetTypes'
import UpdateButton from './UpdateButton.vue'
import { termValidator } from '../TermValidator'
import FinishModuleModal from './FinishModuleModal.vue'

const props = defineProps<{
  item: Module
}>()

const emits = defineEmits([
  'delete', 
  'update',
  'unselect'
])

const { item } = toRefs(props)

const sm = ref(false)
const el = ref(null)
const { width } = useElementSize(el)

watch(width, (newWidth) => {
  sm.value = newWidth < 700
}, { immediate: true })

const dialog = ref(false)
const movingModuleToCompleted = ref(false)
const moduleMoveSuccess = ref(false)
const movedModule = ref<CompletedModule>(null)

const completedModuleData = ref({
  completedDate: '',
  grade: null,
})

async function moveToCompleted() {
  movingModuleToCompleted.value = true
  movedModule.value = {
    ...item.value,
    ...completedModuleData.value
  }
  console.log(movedModule.value)
  await moveRowToRange(
    Range.MODULES, 
    Range.COMPLETED_MODULES, 
    item.value.row, 
    unmapCompletedModules([movedModule.value])
  )
  moduleMoveSuccess.value = true
}

function closeDialog() {
  emits('unselect')
  dialog.value = false
}
</script>

<style scoped>
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