<template>
  <div 
    class="d-flex flex-row"
    style="width: 100%; padding: 20px"
  >
    <div style="width: 55%;">
      <p 
        v-if="grad.id"
        style="font-weight: 200"
      >
        {{ grad.id }}
      </p>
      <v-btn 
        v-else
        @click="reqGenerateGradId"
        size="x-small"
        color="purple-darken-2"
      >
        Generate Grad ID
      </v-btn>
      <div class="d-flex flex-row align-center">
        <input 
          v-model="grad.name"
          placeholder="Name"
          type="text" 
          class="header-input"
        >
        <v-spacer></v-spacer>
        <v-btn 
          @click="reqUpdateGrad"
          :loading="updating"
          :color="upToDate ? 'green' : 'purple-darken-2'"
          :style="{
            cursor: upToDate ? 'default' : 'pointer',
          }"
          rounded
          class="ml-7"
        >{{ upToDate ? 'All Synced Up!' : 'Update Grad' }}</v-btn>
      </div>
      <v-divider class="my-2"></v-divider>
      <v-text-field
        v-model="grad.email"
        label="Email"
      >
        <template #prepend>
          <v-icon>mdi-email</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="grad.phone"
        label="Phone"
      >
        <template #prepend>
          <v-icon>mdi-phone</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="grad.graduationDate"
        label="Graduation Date"
      >
        <template #prepend>
          <v-icon>mdi-calendar</v-icon>
        </template>
      </v-text-field>
      <h1 class="mb-2">
        Engagement Tracking
      </h1>
      <p>
        coming soon...
      </p>
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
        delete {{ grad.name.split(' ')[0] }} permanently
      </span>
      <v-textarea
        v-model="grad.note"
        clearable
        :label="`Notes on ${grad.name.split(' ')[0]}`"
      ></v-textarea>
      <v-btn
        @click="moveToStudents"
        :loading="movingGrad"
        size="x-large"
        color="purple-darken-2"
        style="transform: translateY(-60px);"
      >
        <v-icon
          class="mr-4"
          size="x-large"
        >mdi-account-arrow-right</v-icon>
        Move Back to Students
      </v-btn>
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
import { updateByRow, moveRowToRange, Range } from '../SheetsAPI'
import { useAutoSync, useChangeWatcher } from '../AutoSync'
import { unmapGraduates, unmapStudents } from '../DataMappers'
import { Graduate } from '../SheetTypes'

const props = defineProps<{
  item: Graduate,
  autoSync: boolean
}>()

const emits = defineEmits([
  'delete', 
  'update',
  'unselect'
])

const clone = <T>(obj: T) => JSON.parse(JSON.stringify(obj))

const updating = ref(false)
const grad = ref<Graduate>(clone(props.item))
const movingGrad = ref(false)

watch(() => props.item, (newVal) => {
  grad.value = clone(newVal)
})

const { autoSync } = toRefs(props)
useAutoSync(autoSync, reqUpdateGrad)
const { upToDate } = useChangeWatcher(grad)

async function reqUpdateGrad() {
  if (upToDate.value) return
  updating.value = true
  await updateByRow(Range.GRADUATES, grad.value.row, unmapGraduates([grad.value]))
  emits('update', clone(grad.value))
  upToDate.value = true
  updating.value = false
}

async function reqGenerateGradId() {
  const newId = 'G' + Math.random().toString().substring(2, 9);
  grad.value.id = newId
  await reqUpdateGrad()
}

async function moveToStudents() {
  movingGrad.value = true
  await moveRowToRange(
    Range.GRADUATES,
    Range.STUDENTS,
    grad.value.row,
    await unmapStudents([{
      row: grad.value.row,
      id: grad.value.id.startsWith('G') ? '' : grad.value.id,
      name: grad.value.name,
      email: grad.value.email,
      points: 0,
      activeStatus: 'Active',
      year: '',
      note: grad.value.note,
      misc: {}
    }])
  )
  emits('unselect')
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