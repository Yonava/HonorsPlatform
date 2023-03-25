<template>
  <div 
    class="d-flex flex-row"
    style="width: 100%; padding: 20px"
  >
    <div style="width: 55%;">
      <p
        v-if="item.id"
        style="font-weight: 200"
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
        <v-btn 
          @click="reqUpdateStudent"
          :loading="updatingStudent"
          :color="upToDate ? 'green' : 'blue-darken-2'"
          :style="{
            cursor: upToDate ? 'default' : 'pointer',
          }"
          rounded
          class="ml-7"
        >{{ upToDate ? 'All Synced Up!' : 'Update Profile' }}</v-btn>
      </div>
      <v-divider class="my-2"></v-divider>
      <v-text-field
        v-model="item.email"
        label="Email"
      >
        <template #prepend>
          <v-icon>mdi-email</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="item.points"
        label="Points"
      >
        <template #prepend>
          <v-icon>mdi-ticket</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="item.activeStatus"
        label="Active Status"
      >
        <template #prepend>
          <v-icon>mdi-card-account-details</v-icon>
        </template>
      </v-text-field>
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
      <div v-else>
        <v-icon size="x-large">mdi-lock</v-icon>
        <h1>
          Module Tracking Locked
        </h1>
        <p>
          Add a student ID to this profile to unlock module tracking tools.
        </p>
      </div>
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
        delete {{ item.name }} permanently
      </span>
      <v-textarea
        v-model="item.note"
        clearable
        :label="`${item.name.split(' ')[0]}'s meeting notes`"
      ></v-textarea>
    </div>
    <ModuleAddModal 
      @close="showModuleAddModal = false"
      @reFetchModules="refetchModules = !refetchModules"
      :show="showModuleAddModal"
      :studentId="item.id"
    />
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
import ModuleFetch from './ModuleFetch.vue'
import ModuleAddModal from './ModuleAddModal.vue'
import { updateByRow } from '../SheetsAPI'
import { useAutoSync, useChangeWatcher } from '../AutoSync'
import { unmapStudents } from '../DataMappers'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  autoSync: {
    type: Boolean,
    required: true
  }
})

const emits = defineEmits([
  'delete', 
  'update'
])

const reqDeleteStudent = () => {
  if (!canDelete.value) return
  emits('delete')
}

const updatingStudent = ref(false)
const showModuleAddModal = ref(false)
const refetchModules = ref(false)
const tempStudentId = ref('')
const dialog = ref(false)

// emitted from ModuleFetch
const moduleListEmpty = ref(false)

const canDelete = computed(() => {
  return moduleListEmpty.value || !item.value.id
})

const { item, autoSync } = toRefs(props)
useAutoSync(autoSync, reqUpdateStudent)
const { upToDate } = useChangeWatcher(item)

function studentIdRule(studentId) {
  return parseInt(studentId) && studentId.length === 7 || 'Invalid Student ID'          
}

async function reqUpdateStudent() {
  if (upToDate.value) return
  updatingStudent.value = true
  const row = item.value.row
  const range = `Students`
  await updateByRow(range, row, await unmapStudents([item.value]))
  emits('update', item.value)
  updatingStudent.value = false
  upToDate.value = true
}

async function saveId() {
  if (!studentIdRule(tempStudentId.value)) return
  item.value.id = tempStudentId.value
  await reqUpdateStudent()
  dialog.value = false
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