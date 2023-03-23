<template>
  <div 
    class="d-flex flex-row"
    style="width: 100%; padding: 20px"
  >
    <div style="width: 55%;">
      <p style="font-weight: 200">
        {{ item.id }}
      </p>
      <div class="d-flex flex-row align-center">
        <input 
          v-model="item.name"
          placeholder="Enter Name"
          type="text" 
          class="item-name-input"
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
        outlined
      >
        <template #prepend>
          <v-icon>mdi-email</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="item.points"
        label="Points"
        outlined
      >
        <template #prepend>
          <v-icon>mdi-ticket</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="item.activeStatus"
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
          :studentId="item.id"
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
          v-for="(value, key) in item.misc"
          :key="key"
          style="width: 30%;"
          class="mx-1"
        >
          <v-text-field
            :label="key"
            outlined
            v-model="item.misc[key]"
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
          `${canBeDeleted ? 'delete-student' : 'delete-student-disabled'}`
        ]"
      >
        <v-icon>mdi-delete</v-icon>
        delete {{ item.name }} permanently
      </span>
      <v-textarea
        v-model="item.note"
        clearable
        :label="`leave a note on ${item.name}`"
        no-resize
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
  toRefs, 
  onMounted,
  onUnmounted
} from 'vue'
import ModuleFetch from './ModuleFetch.vue'
import ModuleAddModal from './ModuleAddModal.vue'
import { updateStudent } from '../SheetsAPI'
import { useAutoSync, useChangeWatcher } from '../AutoSync'

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

const emits = defineEmits(['delete'])
const reqDeleteStudent = () => {
  if (!canBeDeleted.value) return
  emits('delete')
}

const editingName = ref(false)
const updatingStudent = ref(false)
const showModuleAddModal = ref(false)
const refetchModules = ref(false)
const canBeDeleted = ref(false)

const { item, autoSync } = toRefs(props)
useAutoSync(autoSync, reqUpdateStudent)
const { upToDate } = useChangeWatcher(item)

async function reqUpdateStudent() {
  if (upToDate.value) return
  updatingStudent.value = true
  await updateStudent(item.value)
  updatingStudent.value = false
  upToDate.value = true
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