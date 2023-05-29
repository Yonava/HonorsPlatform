<template>
  <div>
    <DetailFrame
      v-model="student.note"
      :disableDelete="!canDelete"
    >
      <template #main>
        <DetailHeader
          v-model="student.name"
          :id="student.id"
          placeholder="Student Name"
        >
          <template
            v-if="!student.id"
            #id
          >
            <v-dialog
              v-model="idDialog"
              width="300"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="x-small"
                  color="red"
                >
                  Add Student ID
                </v-btn>
              </template>
              <div class="student-id-dialog pa-4">
                <v-icon color="red">mdi-alert</v-icon>
                <p
                  style="color: red"
                  class="mb-2"
                >
                  Warning: Student IDs are unique and cannot be changed once set!
                </p>
                <v-text-field
                  v-model="tempStudentId"
                  :rules="[studentIdRule]"
                  variant="solo"
                  label="Student ID"
                  class="mb-2"
                ></v-text-field>
                <div class="d-flex">
                  <v-btn
                    @click="saveId"
                    :disabled="typeof studentIdRule(tempStudentId) === 'string'"
                    color="green"
                  >
                    Save
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    @click="idDialog = false"
                    color="red"
                  >
                    Cancel
                  </v-btn>
                </div>
              </div>
            </v-dialog>
          </template>
        </DetailHeader>
        <v-btn
          v-if="!student.email"
          @click="student.email = getStudentEmail(student.name)"
          size="x-small"
          color="blue-darken-2"
          class="mb-3"
        >new student email</v-btn>
        <div class="d-flex align-center">
          <v-text-field
            v-model="student.email"
            :rules="[(v) => emailValidator(v) || 'Invalid email']"
            clearable
            label="Email"
            prepend-icon="mdi-email"
          ></v-text-field>
          <v-btn
            v-if="student.email"
            @click="sendEmail(student.email)"
            class="ml-4"
            size="small"
            color="blue-darken-2"
          >
            email
          </v-btn>
        </div>
        <v-text-field
          v-model.number="student.points"
          label="Points"
          type="number"
          prepend-icon="mdi-ticket"
        ></v-text-field>
        <div class="d-flex flex-row">
          <v-select
            v-model="student.activeStatus"
            :items="Object.keys(statusOptions)"
            :prepend-icon="`mdi-${statusOptions[student.activeStatus]}`"
            label="Active Status"
            style="width: 15%;"
            class="mr-4"
          ></v-select>
          <v-select
            v-model="student.year"
            :items="yearOptions"
            label="Year"
            style="width: 15%;"
            prepend-icon="mdi-calendar"
          >
          </v-select>
        </div>
        <!-- clearable on this auto-complete is incompatible with state syncing to google drive -->
        <v-autocomplete
          v-model="student.athletics"
          :items="Object.keys(athleticOptions)"
          :prepend-icon="`mdi-${athleticOptions[student.athletics]}`"
          label="Athletics"
          class="mt-2"
        ></v-autocomplete>

        <ModuleFetch
          @update="modules = $event"
          @loading-state="loadingModules = $event"
          :id="student.id"
        />

        <div style="width: 1px; height: 10px"></div>

        <h2>
          Other:
        </h2>
        <div
          style="overflow: auto; max-height: 180px;"
          class="d-flex flex-row flex-wrap"
        >
          <div
            v-for="(value, key) in student.misc"
            :key="key"
            style="width: 30%;"
            class="mx-1"
          >
            <v-text-field
              v-model="student.misc[key]"
              :label="key"
              outlined
            ></v-text-field>
          </div>
          <div v-if="Object.keys(student.misc).length === 0">
            No additional information. Allocate custom data tracking on google sheets.
          </div>
        </div>
      </template>
      <template #notes-button>
        <v-btn
          @click="showAddNote = true"
          size="x-small"
          color="blue-darken-2"
          class="mb-3"
        >Add Meeting Note</v-btn>
      </template>
      <template #buttons>
        <div
          class="d-flex flex-row justify-space-between"
          style="width: 100%"
        >
          <v-btn
            @click="viewThesis"
            :color="getPanel('THESES').color"
            size="large"
            style="width: 49%"

          >
            <v-icon
              class="mr-4"
              size="x-large"
            >{{ getPanel('THESES').icon }}</v-icon>
            View Thesis
          </v-btn>
          <v-btn
            @click="graduate"
            :disabled="!canDelete"
            :loading="movingStudent"
            size="large"
            :color="getPanel('GRADUATES').color"
            style="width: 49%"
          >
            <v-icon
              class="mr-4"
              size="x-large"
            >{{ getPanel('GRADUATES').icon }}</v-icon>
            Graduate
          </v-btn>
        </div>
      </template>
    </DetailFrame>
    <AddStudentNote
      @success="addStudentNote($event)"
      @close="showAddNote = false"
      :show="
      showAddNote"
    />
  </div>
</template>


<script setup lang="ts">
import {
  ref,
  computed,
} from 'vue'
import DetailFrame from './Helper/DetailFrame.vue'
import DetailHeader from './Helper/DetailHeader.vue'
import ModuleFetch from './Helper/ModuleFetch.vue'
import AddStudentNote from './Helper/AddStudentNote.vue'
import type { Module } from '../../SheetTypes'
import { athleticOptions } from '../../Athletics'
import { emailValidator, getStudentEmail, sendEmail } from '../../EmailUtilities'
import { getPanel } from '../../Panels'
import { moveToGraduates, yearOptions, statusOptions } from '../../StudentTools'

import { useSheetManager } from '../../store/useSheetManager'
import { storeToRefs } from 'pinia'
import { useUpdateItem } from '../../TrackItemForUpdate'

const sheetManager = useSheetManager()
const { selectedItem: student } = storeToRefs(sheetManager)
useUpdateItem(student)

const modules = ref<Module[]>([])
const loadingModules = ref(false)

const tempStudentId = ref('')
const idDialog = ref(false)
const movingStudent = ref(false)

const showAddNote = ref(false)

const canDelete = computed(() => {
  if (!student.value.id) return true
  return modules.value.length === 0 && !loadingModules.value
})

function studentIdRule(studentId: string) {
  if (/^\d{7}$/.test(studentId)) return true
  return 'Invalid Student ID'
}

async function saveId() {
  student.value.id = tempStudentId.value
  idDialog.value = false
}

function viewThesis() {
  sheetManager.setPanel(getPanel('THESES'), {
    key: 'studentId',
    value: student.value.id,
  })
}

async function graduate() {
  movingStudent.value = true
  moveToGraduates(student.value)
  sheetManager.setItem(null)
}

function addStudentNote(event: { initials: string, note: string }) {
  const { initials, note } = event
  let studentNote = student.value.note
  if (studentNote) studentNote += '\n\n'
  studentNote += `${initials}: ${note}`
}
</script>

<style scoped>
.student-id-dialog {
  background: rgb(244, 244, 244);
  border-radius: 5px;
  box-shadow: 0 0 10px 0 rgba(0,0,0,0.2);
}
</style>