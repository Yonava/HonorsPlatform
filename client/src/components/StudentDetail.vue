<template>
  <div 
    class="d-flex flex-row"
    style="width: 100%; padding: 20px"
  >
    <div style="width: 55%;">
      <p
        v-if="item.value.id"
        style="font-weight: 200"
      >
        {{ item.value.id }}
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
          v-model="item.value.name"
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
      <div class="d-flex align-center">
        <v-text-field
          v-model="item.value.email"
          label="Email"
          prepend-icon="mdi-email"
          class="mr-4"
        ></v-text-field>
        <v-btn 
          @click="sendEmail"
          size="small"
          color="blue-darken-2"
        >
          email {{ item.value.name.split(' ')[0] }}
        </v-btn>
      </div>
      <v-text-field
        v-model.number="item.value.points"
        label="Points"
        type="number"
      >
        <template #prepend>
          <v-icon>mdi-ticket</v-icon>
        </template>
      </v-text-field>
      <div class="d-flex flex-row">
        <v-select
          v-model="item.value.activeStatus"
          :items="Object.keys(statusOptions)"
          :prepend-icon="`mdi-${statusOptions[item.value.activeStatus]}`"
          label="Active Status"
          style="width: 15%;"
          class="mr-4"
        ></v-select>
        <v-select
          v-model="item.value.year"
          :items="yearOptions"
          label="Year"
          style="width: 15%;"
          prepend-icon="mdi-calendar"
        >
        </v-select>
      </div>
      <v-select
        v-model="item.value.athletics"
        :items="Object.keys(athleticOptions)"
        :prepend-icon="`mdi-${athleticOptions[item.value.athletics]}`"
        label="Athletics"
        class="mt-2"
      ></v-select>
      <v-divider class="my-2"></v-divider>
      <div v-if="item.value.id">
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
          :studentId="item.value.id"
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
          v-for="(value, key) in item.value.misc"
          :key="key"
          style="width: 30%;"
          class="mx-1"
        >
          <v-text-field
            v-model="item.value.misc[key]"
            :label="key"
            outlined
          ></v-text-field>
        </div>
        <div v-if="Object.keys(item.value.misc).length === 0">
          No additional information. Allocate custom data tracking on google sheets.
        </div>
      </div>
    </div>
    <div 
      style="width: 45%;" 
      class="ml-5 d-flex flex-column"
    >
      <span 
        @click="reqDeleteStudent"
        :class="[
          'd-flex', 
          'align-center', 
          'mb-2', 
          `${canDelete ? 'delete-student' : 'delete-student-disabled'}`
        ]"
      >
        <v-icon>mdi-delete</v-icon>
        delete {{ item.value.name }} permanently
      </span>
      <v-textarea
        v-model="item.value.note"
        clearable
        :label="`${item.value.name.split(' ')[0]}'s meeting notes`"
      ></v-textarea>
      <v-btn
        @click="moveToGraduates"
        :disabled="!canDelete"
        :loading="movingStudent"
        size="x-large"
        color="blue-darken-2"
        style="transform: translateY(-130px);"
      >
        <v-icon 
          class="mr-4"
          size="x-large"
        >mdi-school-outline</v-icon>
        Graduate {{ item.value.name.split(' ')[0] }}
      </v-btn>
    </div>
    <AddModal 
      @close="showModuleAddModal = false"
      @success="refetchModules = !refetchModules"
      :show="showModuleAddModal"
      :panel="switchPanel(PanelType.MODULES)"
      :override="{
        color: 'blue',
        predefineColumnData: [item.value.id],
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
  onMounted,
  onUnmounted,
} from 'vue'
import type { Ref } from 'vue'
import ModuleFetch from './ModuleFetch.vue'
import AddModal from './AddModal.vue'
import LockArea from './LockArea.vue'
import UpdateButton from './UpdateButton.vue'
import { updateByRow, moveRowToRange, Range } from '../SheetsAPI'
import { switchPanel, PanelType } from '../SwitchPanel'
import { unmapStudents, unmapGraduates } from '../DataMappers'
import { Student } from '../SheetTypes'
import { athleticOptions } from '../Athletics'

const props = defineProps<{
  item: Ref<Student>
}>()

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
  return moduleListEmpty.value || !props.item.value.id
})

function sendEmail() {
  const { name, email } = props.item.value
  const subject = `Hello ${name.split(' ')[0]}!`
  const body = `Hi ${name.split(' ')[0]},%0D%0A%0D%0A`
  window.open(`mailto:${email}?subject=${subject}&body=${body}`)
}

function studentIdRule(studentId: string) {
  return parseInt(studentId) && studentId.length === 7 || 'Invalid Student ID'          
}

async function saveId() {
  if (!studentIdRule(tempStudentId.value)) return
  const { id, ...rest } = props.item.value
  updatingStudent.value = true
  const newStudent = {
    ...rest,
    id: tempStudentId.value,
  }
  await updateByRow(
    Range.STUDENTS, 
    props.item.value.row, 
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
    props.item.value.row, 
    unmapGraduates([{
      row: props.item.value.row,
      id: props.item.value.id,
      name: props.item.value.name,
      phone: '',
      email: props.item.value.email,
      graduationDate: new Date().toLocaleDateString(),
      note: props.item.value.note,
    }])
  )
  emits('unselect')
}
</script>

<style scoped>
.delete-student-disabled {
  opacity: 0.25;
  cursor: default;
}

.delete-student {
  color: red;
  cursor: pointer;
}

.delete-student:hover {
  text-decoration: underline;
}

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