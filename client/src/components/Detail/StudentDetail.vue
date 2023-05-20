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
      <DetailHeader
        v-model="item.name"
        :id="item.id"
        placeholder="Student Name"
      >
        <template
          v-if="!item.id"
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
        v-if="!item.email"
        @click="item.email = getStudentEmail(item.name)"
        size="x-small"
        color="blue-darken-2"
        class="mb-3"
      >new student email</v-btn>
      <div class="d-flex align-center">
        <v-text-field
          v-model="item.email"
          :rules="[(v) => emailValidator(v) || 'Invalid email']"
          clearable
          label="Email"
          prepend-icon="mdi-email"
        ></v-text-field>
        <v-btn
          v-if="item.email"
          @click="sendEmail"
          class="ml-4"
          size="small"
          color="blue-darken-2"
        >
          draft email
        </v-btn>
      </div>
      <v-text-field
        v-model.number="item.points"
        label="Points"
        type="number"
        prepend-icon="mdi-ticket"
      ></v-text-field>
      <div class="d-flex flex-row">
        <v-select
          v-model="item.activeStatus"
          :items="Object.keys(statusOptions)"
          :prepend-icon="`mdi-${statusOptions[item.activeStatus]}`"
          label="Active Status"
          style="width: 15%;"
          class="mr-4"
        ></v-select>
        <v-select
          v-model="item.year"
          :items="yearOptions"
          label="Year"
          style="width: 15%;"
          prepend-icon="mdi-calendar"
        >
        </v-select>
      </div>
      <!-- clearable on this auto-complete is incompatible with state syncing to google drive -->
      <v-autocomplete
        v-model="item.athletics"
        :items="Object.keys(athleticOptions)"
        :prepend-icon="`mdi-${athleticOptions[item.athletics]}`"
        label="Athletics"
        class="mt-2"
      ></v-autocomplete>

      <ModuleFetch
        @update="modules = $event"
        @loading-state="loadingModules = $event"
        :id="item.id"
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
          v-for="(value, key) in item.misc"
          :key="key"
          style="width: 30%;"
          class="mx-1"
        >
          <v-text-field
            v-model="item.misc[key]"
            :label="key"
            outlined
          ></v-text-field>
        </div>
        <div v-if="Object.keys(item.misc).length === 0">
          No additional information. Allocate custom data tracking on google sheets.
        </div>
      </div>
    </div>
    <v-divider
      v-if="sm"
      class="my-2"
    ></v-divider>
    <div
      :class="[
        sm ? '' : 'ml-5',
        'd-flex',
        'flex-column',
        'align-center'
      ]"
      :style="sm ? '' : 'width: 55%; max-width: 450px'"
    >
      <div style="width: 100%;">
        <v-btn
          @click="showAddNote = true"
          size="x-small"
          color="blue-darken-2"
          class="mb-3"
        >Add Meeting Note</v-btn>
        <v-textarea
          v-model="item.note"
          auto-grow
          variant="outlined"
          clearable
          label="Meeting notes"
        ></v-textarea>
      </div>
      <div
        :class="[
          'd-flex',
          'flex-column'
        ]"
        style="width: 100%;"
      >
        <div 
          class="d-flex flex-row justify-space-between" 
          style="width: 100%"
        >
          <v-btn
            @click="viewThesis"
            size="large"
            :color="switchPanel(PanelType.THESES).color"
            style="width: 49%"

          >
            <v-icon
              class="mr-4"
              size="x-large"
            >{{ switchPanel(PanelType.THESES).icon }}</v-icon>
            View Thesis
          </v-btn>
          <v-btn
            @click="moveToGraduates"
            :disabled="!canDelete"
            :loading="movingStudent"
            size="large"
            :color="switchPanel(PanelType.GRADUATES).color"
            style="width: 49%"
          >
            <v-icon
              class="mr-4"
              size="x-large"
            >{{ switchPanel(PanelType.GRADUATES).icon }}</v-icon>
            Graduate
          </v-btn>
        
        </div>
        <v-btn
          @click="reqDeleteStudent"
          :disabled="!canDelete"
          size="large"
          color="red"
          class="mt-3"
        >
          <v-icon
            class="mr-4"
            size="x-large"
          >mdi-delete</v-icon>
          delete {{ item.name }}
        </v-btn>
      </div>
    </div>
    <AddStudentNote
      @success="addStudentNote($event)"
      @close="showAddNote = false"
      :show="showAddNote"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
  computed,
  toRefs
} from 'vue'
import { useElementSize } from '@vueuse/core'
import { useDisplay } from 'vuetify'
import DetailHeader from './Helper/DetailHeader.vue'
import ModuleFetch from './Helper/ModuleFetch.vue'
import AddStudentNote from './Helper/AddStudentNote.vue'
import { moveRowToRange, Range } from '../../SheetsAPI'
import { unmapStudents, unmapGraduates } from '../../DataMappers'
import { Student, Module } from '../../SheetTypes'
import { athleticOptions } from '../../Athletics'
import { emailValidator, getStudentEmail } from '../../EmailUtilities'
import { switchPanel, PanelType } from '../../SwitchPanel'

const props = defineProps<{
  item: Student
}>()

const { xs } = useDisplay()

const emits = defineEmits([
  'delete',
  'unselect',
  'changePanel',
])

const statusOptions = {
  'Active': 'account-check',
  'Inactive': 'account-remove',
  'Pending': 'account-question',
}

enum ActiveStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PENDING = 'Pending',
}

const yearOptions = [
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Other'
]

const sm = ref(false)
const el = ref(null)
const { width } = useElementSize(el)

watch(props.item, (newItem) => {
  if (!newItem.id && !newItem.activeStatus) {
    newItem.activeStatus = ActiveStatus.PENDING
  } else if (!newItem.activeStatus) {
    newItem.activeStatus = ActiveStatus.ACTIVE
  }
}, { immediate: true })

watch(width, (newWidth) => {
  sm.value = newWidth < 700
}, { immediate: true })

function reqDeleteStudent() {
  if (!canDelete.value) return
  emits('delete')
}

const modules = ref<Module[]>([])
const loadingModules = ref(false)

const tempStudentId = ref('')
const idDialog = ref(false)
const movingStudent = ref(false)

const showAddNote = ref(false)

const canDelete = computed(() => {
  return modules.value.length === 0 && !loadingModules.value
})

function sendEmail() {
  const { email } = props.item
  window.open(`mailto:${email}`)
}

function studentIdRule(studentId: string) {
  if (/^\d{7}$/.test(studentId)) return true
  return 'Invalid Student ID'
}

async function saveId() {
  props.item.id = tempStudentId.value
  idDialog.value = false
}

function viewThesis() {
  emits('changePanel', {
    location: PanelType.THESES, 
    id: {
      key: 'studentId',
      value: props.item.id
    }
  })
}

async function moveToGraduates() {
  movingStudent.value = true
  await moveRowToRange(
    Range.STUDENTS,
    Range.GRADUATES,
    props.item.row,
    unmapGraduates([{
      row: props.item.row,
      id: props.item.id,
      name: props.item.name,
      phone: '',
      email: props.item.email,
      graduationDate: new Date().toLocaleDateString(),
      note: props.item.note,
    }])
  )
  emits('unselect')
}

function addStudentNote(event: { initials: string, note: string }) {
  const { initials, note } = event
  if (props.item.note) props.item.note += '\n\n'
  props.item.note += `${initials}: ${note}`
}
</script>

<style scoped>
.student-id-dialog {
  background: rgb(244, 244, 244);
  border-radius: 5px;
  box-shadow: 0 0 10px 0 rgba(0,0,0,0.2);
}
</style>