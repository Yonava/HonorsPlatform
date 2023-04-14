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
      <p
        v-if="item.id"
        style="font-weight: 200;"
      >
        {{ item.id }}
      </p>
      <v-dialog 
        v-else
        v-model="dialog"
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
          <div v-if="!updatingStudent">
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
                @click="dialog = false"
                color="red"
              >
                Cancel
              </v-btn>
            </div>
          </div>
          <div v-else>
            <v-progress-circular
              indeterminate
              color="blue"
            ></v-progress-circular>
          </div>
        </div>
      </v-dialog>
      <div class="d-flex flex-row align-center">
        <input 
          v-model="item.name"
          placeholder="Enter Name"
          type="text" 
          class="student-name-input"
        >
        <v-spacer></v-spacer>
        <update-button 
          @updated="$emit('update', $event)" 
          :item="item"
        />
      </div>
      <v-divider class="my-2"></v-divider>
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
          label="Email"
          prepend-icon="mdi-email"
          class="mr-4" 
        ></v-text-field>
        <v-btn 
          v-if="item.email"
          @click="sendEmail"
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
      <v-autocomplete
        v-model="item.athletics"
        :items="Object.keys(athleticOptions)"
        :prepend-icon="`mdi-${athleticOptions[item.athletics]}`"
        label="Athletics"
        class="mt-2"
      ></v-autocomplete>
      <v-divider class="my-2"></v-divider>
      <div v-if="item.id">
        <div class="d-flex flex-row align-center">
          <h2>
            Modules In Progress:
          </h2>
          <v-spacer></v-spacer>
          <v-btn
            @click="showModuleAddModal = true"
            size="small"
            color="green"
          >
            <v-icon class="mr-1">mdi-plus</v-icon>
            Add Module
          </v-btn>
        </div>
        <ModuleFetch
          @toggleCanDelete="moduleListEmpty = !moduleListEmpty"
          :studentId="item.id"
          :refetch="refetchModules"
        />
      </div>
      <LockArea 
        v-else
        title="Module Tracking"
        condition="student ID"
      />
      <v-divider class="my-2"></v-divider>
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
      :style="sm ? '' : 'width: 55%'"
    >
      <div style="width: 100%;">
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
        style="width: 100%"
      >
        <v-btn
          @click="moveToGraduates"
          :disabled="!canDelete"
          :loading="movingStudent"
          size="large"
          color="blue-darken-2"
        >
          <v-icon 
            class="mr-4"
            size="x-large"
          >mdi-school-outline</v-icon>
          Move To Graduates
        </v-btn>
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
          delete {{ item.name.split(' ')[0] }}
        </v-btn>
      </div>
    </div>
    <AddModal 
      @close="showModuleAddModal = false"
      @success="refetchModules = !refetchModules"
      :show="showModuleAddModal"
      :panel="switchPanel(PanelType.MODULES)"
      :override="{
        color: 'blue',
        predefineColumnData: [item.id],
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { 
  ref, 
  watch, 
  computed,
  toRefs,
  inject
} from 'vue'
import { useElementSize } from '@vueuse/core'
import { useDisplay } from 'vuetify'
import ModuleFetch from './ModuleFetch.vue'
import AddModal from './AddModal.vue'
import LockArea from './LockArea.vue'
import UpdateButton from './UpdateButton.vue'
import { updateByRow, moveRowToRange, Range } from '../SheetsAPI'
import { switchPanel, PanelType } from '../SwitchPanel'
import { unmapStudents, unmapGraduates } from '../DataMappers'
import { Student, Module } from '../SheetTypes'
import { athleticOptions } from '../Athletics'
import { emailValidator, getStudentEmail } from '../EmailUtilities'

const props = defineProps<{
  item: Student
}>()

const { item } = toRefs(props)
const { xs } = useDisplay()

const emits = defineEmits([
  'delete', 
  'update',
  'unselect'
])

const statusOptions = {
  'Active': 'account-check',
  'Inactive': 'account-remove',
  'Graduated': 'school',
  'Dropped': 'account-off',
  'On Hold': 'account-clock',
  'Pending': 'account-question',
}

const yearOptions = [
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
]

const sm = ref(false)
const el = ref(null)
const { width } = useElementSize(el)

watch(width, (newWidth) => {
  sm.value = newWidth < 700
}, { immediate: true })

function reqDeleteStudent() {
  if (!canDelete.value) return
  emits('delete')
}

const updatingStudent = ref(false)
const showModuleAddModal = ref(false)
const refetchModules = ref(false)
const tempStudentId = ref('')
const dialog = ref(false)
const movingStudent = ref(false)

// emitted from ModuleFetch
const moduleListEmpty = ref(false)

const canDelete = computed(() => {
  return moduleListEmpty.value || !item.value.id
})

function sendEmail() {
  const { name, email } = item.value
  const subject = `Hello ${name.split(' ')[0]}!`
  const body = `Hi ${name.split(' ')[0]},%0D%0A%0D%0A`
  window.open(`mailto:${email}?subject=${subject}&body=${body}`)
}

function studentIdRule(studentId: string) {
  return parseInt(studentId) && studentId.length === 7 || 'Invalid Student ID'          
}

async function saveId() {
  if (!studentIdRule(tempStudentId.value)) return
  const { id, ...rest } = item.value
  updatingStudent.value = true
  const newStudent = {
    ...rest,
    id: tempStudentId.value,
  }
  await updateByRow(
    Range.STUDENTS, 
    item.value.row, 
    await unmapStudents([newStudent])
  )
  emits('update', newStudent)
  updatingStudent.value = false
  dialog.value = false
}

async function moveToGraduates() {
  movingStudent.value = true
  await moveRowToRange(
    Range.STUDENTS, 
    Range.GRADUATES,
    item.value.row, 
    unmapGraduates([{
      row: item.value.row,
      id: item.value.id,
      name: item.value.name,
      phone: '',
      email: item.value.email,
      graduationDate: new Date().toLocaleDateString(),
      note: item.value.note,
    }])
  )
  emits('unselect')
}
</script>

<style scoped>
input.student-name-input {
  font-weight: 900; 
  font-size: 3em; 
  line-height: 0.9; 
  width: 100%;
}

input.student-name-input:focus {
  outline: none;
}

.student-id-dialog {
  background: rgb(230, 230, 230); 
  border-radius: 5px; 
  box-shadow: 0 0 10px 0 rgba(0,0,0,0.2);
}

.op {
  opacity: 1 !important
}
</style>