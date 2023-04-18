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
        v-if="!item.id"
        v-model="item.name"
        placeholder="Student Name"
      >
        <template #id>
          <v-dialog 
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
          </v-dialog>
        </template>
      </DetailHeader>
      <DetailHeader 
        v-else
        v-model="item.name"
        :id="item.id"
        placeholder="Student Name"
      />
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
      
      <ModuleFetch
        @update="modules = $event"
        @loading-state="loadingModules = $event"
        :id="item.id"
      />

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
import DetailHeader from './DetailHeader.vue'
import ModuleFetch from './ModuleFetch.vue'
import AddStudentNote from './AddStudentNote.vue'
import { updateByRow, moveRowToRange, Range } from '../SheetsAPI'
import { unmapStudents, unmapGraduates } from '../DataMappers'
import { Student, Module } from '../SheetTypes'
import { athleticOptions } from '../Athletics'
import { emailValidator, getStudentEmail } from '../EmailUtilities'

const props = defineProps<{
  item: Student
}>()

const { xs } = useDisplay()

const emits = defineEmits([
  'delete', 
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

enum ActiveStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  GRADUATED = 'Graduated',
  DROPPED = 'Dropped',
  ON_HOLD = 'On Hold',
  PENDING = 'Pending',
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

watch(props.item, (newItem) => {
  if (!newItem.points) {
    newItem.points = 0
  }

  if (!newItem.id && !newItem.activeStatus) {
    newItem.activeStatus = ActiveStatus.PENDING
  }
})

watch(width, (newWidth) => {
  sm.value = newWidth < 700
}, { immediate: true })

function reqDeleteStudent() {
  if (!canDelete.value) return
  emits('delete')
}

const updatingStudent = ref(false)
const refetchModules = ref(false)
const tempStudentId = ref('')
const dialog = ref(false)
const movingStudent = ref(false)

const modules = ref<Module[]>([])
const loadingModules = ref(false)

const showAddNote = ref(false)

const canDelete = computed(() => {
  return modules.value.length === 0 && !loadingModules.value
})

function sendEmail() {
  const { name, email } = props.item
  const subject = `Hello ${name.split(' ')[0]}!`
  const body = `Hi ${name.split(' ')[0]},%0D%0A%0D%0A`
  window.open(`mailto:${email}?subject=${subject}&body=${body}`)
}

function studentIdRule(studentId: string) {
  return parseInt(studentId) && studentId.length === 7 || 'Invalid Student ID'          
}

async function saveId() {
  if (!studentIdRule(tempStudentId.value)) return
  props.item.id = tempStudentId.value
  dialog.value = false
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
</style>