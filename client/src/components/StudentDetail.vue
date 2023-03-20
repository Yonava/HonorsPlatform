<template>
  <div 
    class="d-flex flex-row"
    style="width: 100%; padding: 20px"
  >
    <div style="width: 55%;">
      <p style="font-weight: 200">
        {{ student.id }}
      </p>
      <div class="d-flex flex-row align-center">
        <input 
          v-model="student.name"
          placeholder="Name"
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
        v-model="student.email"
        label="Email"
        outlined
      >
        <template #prepend>
          <v-icon>mdi-email</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="student.points"
        label="Points"
        outlined
      >
        <template #prepend>
          <v-icon>mdi-ticket</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="student.activeStatus"
        label="Active Status"
        outlined
      >
        <template #prepend>
          <v-icon>mdi-card-account-details</v-icon>
        </template>
      </v-text-field>
      <v-divider class="my-2"></v-divider>
      <div>
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
          @toggleCanDelete="canBeDeleted = !canBeDeleted"
          :studentId="student.id"
          :refetch="refetchModules"
        />
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
          v-for="(value, key) in student.misc"
          :key="key"
          style="width: 30%;"
          class="mx-1"
        >
          <v-text-field
            :label="key"
            outlined
            v-model="student.misc[key]"
          ></v-text-field>
        </div>
        <div v-if="Object.keys(student.misc).length === 0">
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
        :style="{
          color: canBeDeleted ? '#e74c3c' : '#bdc3c7',
          cursor: canBeDeleted ? 'pointer' : 'default',
        }" 
        class="d-flex align-center mb-2 delete-student"
      >
        <v-icon>mdi-delete</v-icon>
        delete {{ student.name }} permanently
      </span>
      {{ canBeDeleted }}
      <v-textarea
        v-model="student.note"
        clearable
        :label="`leave a note on ${student.name}`"
        no-resize
      ></v-textarea>
    </div>
    <ModuleAddModal 
      @close="showModuleAddModal = false"
      @reFetchModules="refetchModules = !refetchModules"
      :show="showModuleAddModal"
      :studentId="student.id"
    />
  </div>
</template>

<script setup lang="ts">
import { 
  ref, 
  defineProps, 
  defineEmits, 
  watch, 
  toRefs, 
  onMounted,
  onUnmounted
} from 'vue'
import ModuleFetch from './ModuleFetch.vue'
import ModuleAddModal from './ModuleAddModal.vue'
import { updateStudent } from '../SheetsAPI'

const props = defineProps({
  student: {
    type: Object,
    required: true
  },
  autoSync: {
    type: Boolean,
    required: true
  }
})

const emits = defineEmits(['delete'])
const reqDeleteStudent = () => {
  if (!canBeDeleted.value) return
  emits('delete')
}

const editingName = ref(false)
const updatingStudent = ref(false)
const upToDate = ref(false)
const showModuleAddModal = ref(false)
const refetchModules = ref(false)
const canBeDeleted = ref(false)

const { student, autoSync } = toRefs(props)
let studentWatcher = () => {}

watch(student, () => {
  upToDate.value = false
})

watch(upToDate, (val) => {
  if (val) {
    studentWatcher = watch(student, () => {
      upToDate.value = false
    }, { deep: true })
  } else {
    studentWatcher()
  }
})

const interval = ref(undefined)

onMounted(() => {
  interval.value = setInterval(() => {
    if (autoSync.value) {
      reqUpdateStudent()
    }
  }, 3000)
})

onUnmounted(() => {
  clearInterval(interval.value)
})

async function reqUpdateStudent() {
  if (upToDate.value) return
  updatingStudent.value = true
  await updateStudent(student.value)
  updatingStudent.value = false
  upToDate.value = true
}
</script>

<style scoped>
.delete-student:hover {
  color: #e74c3c;
  text-decoration: underline;
}

.student-name-input {
  font-weight: 900; 
  font-size: 3em; 
  line-height: 0.9; 
  width: 100%;
}

.student-name-input:focus {
  outline: none;
}
</style>