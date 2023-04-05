<template>
  <div 
    class="d-flex flex-row"
    style="width: 100%; padding: 20px"
  >
    <div style="width: 55%;">
      <p style="font-weight: 200">
        {{ item.value.studentId }}
      </p>
      <div class="d-flex flex-row align-center">
        <input 
          v-model="item.value.courseCode"
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
        v-model="item.value.term"
        :rules="[(v) => termValidator(v) || 'Potentially invalid term']"
        label="Term"
      >
        <template #prepend>
          <v-icon>mdi-calendar</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="item.value.instructor"
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
          v-model="item.value.docuSignCreated"
          class="mr-6"
          label="DocuSign Created"
        >
          <template #prepend>
            <v-icon>mdi-calendar-alert</v-icon>
          </template>
        </v-text-field>
        <v-text-field
          v-model="item.value.docuSignCompleted"
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
          v-if="!item.value.docuSignCreated"
          @click="item.value.docuSignCreated = new Date().toLocaleDateString()"
          color="orange-darken-2"
          size="small"
        >Created Now</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!item.value.docuSignCompleted"
          @click="item.value.docuSignCompleted = new Date().toLocaleDateString()"
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
          v-if="!moduleMoveSuccess"
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
              class="d-flex flex-column mt-5"
              style="width: 100%;"
            >
              <div>
                <v-text-field
                  v-model="completedModuleData.completedDate"
                  label="Date Completed"
                  variant="outlined"
                  prepend-inner-icon="mdi-calendar"
                  class="mx-2"
                ></v-text-field>
                <v-btn
                  v-if="!completedModuleData.completedDate"
                  @click="completedModuleData.completedDate = new Date().toLocaleDateString()"
                  color="orange-darken-2"
                  size="small"
                  class="ml-2"
                  style="transform: translateY(-10px);"
                >Completed Today</v-btn>
              </div>
              <div class="d-flex flex-column mb-7 mt-3">
                <v-btn
                  v-for="grade in grades"
                  :key="grade"
                  @click="completedModuleData.grade = grade"
                  :color="completedModuleData.grade === grade ? 'orange-darken-2' : 'grey'"
                  rounded
                  class="mx-10 mt-2"
                >{{ grade || "Leave Ungraded" }}</v-btn>
              </div>
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
            >
              <v-icon class="mr-2">mdi-check</v-icon>
              Mark As Complete
            </v-btn>
          </v-card-actions>
        </v-card>
        <v-card
          v-else
          class="d-flex flex-column align-center flex-start pa-3"
        >
          <div class="d-flex flex-row align-center">
            <v-icon
              size="x-large"
              color="orange-darken-2"
              class="mr-4 mb-2"
            >mdi-check</v-icon>
            <h2 style="font-size: 1.5em">
              Module Completed Successfully!
            </h2>
            </div>
            <p>
              Moved {{ movedModule.courseCode }} to completed modules 
              with a grade of {{ movedModule.grade || "ungraded" }}. 
              This module is now accessible through the completed modules tab.
            </p>
          <v-btn
            @click="closeDialog"
            color="orange-darken-2"
            class="mt-5"
          >
            Finish
          </v-btn>
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
        v-model="item.value.description"
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
import type { Ref } from 'vue'
import { updateByRow, moveRowToRange, Range } from '../SheetsAPI'
import { unmapModules, unmapCompletedModules } from '../DataMappers'
import { Module, Grade, CompletedModule } from '../SheetTypes'
import UpdateButton from './UpdateButton.vue'
import { termValidator } from '../TermValidator'

const props = defineProps<{
  item: Ref<Module>
}>()

const emits = defineEmits([
  'delete', 
  'update',
  'unselect'
])

const grades: Grade[] = [
  null,
  'High Pass',
  'Pass',
  'Low Pass',
  'Fail'
]

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
    ...props.item.value,
    ...completedModuleData.value
  }
  await moveRowToRange(
    Range.MODULES, 
    Range.COMPLETED_MODULES, 
    props.item.value.row, 
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