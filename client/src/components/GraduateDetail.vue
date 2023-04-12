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
        style="font-weight: 200"
      >
        {{ item.id }}
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
          v-model="item.name"
          placeholder="Name"
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
        v-model="item.email"
        :rules="[(v) => emailValidator(v) || 'Invalid email']"
        clearable
        label="Email"
        prepend-icon="mdi-email"
      ></v-text-field>

      <v-text-field
        v-model="item.phone"
        :rules="[(v) => phoneValidator(v) || 'Invalid phone number']"
        clearable
        label="Phone"
        prepend-icon="mdi-phone"
      ></v-text-field>

      <v-btn
        v-if="!item.graduationDate"
        @click="item.graduationDate = new Date().toLocaleString().split(',')[0]" 
        size="x-small"
        color="purple-darken-2"
        class="mb-2"
      >Today</v-btn>
      <v-text-field
        v-model="item.graduationDate"
        clearable
        label="Graduation Date"
        prepend-icon="mdi-calendar"
      ></v-text-field>

      <EngagementTracking 
        @update="engagements = $event"
        @loading-state="loadingEngagements = $event"
        :id="item.id"
      />
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
          label="Notes"
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
          @click="moveToStudents"
          :disabled="!canDelete"
          :loading="movingGrad"
          color="purple-darken-2"
          size="large"
        >
          <v-icon
            class="mr-4"
            size="x-large"
          >mdi-account-arrow-right</v-icon>
          Move Back to Students
        </v-btn>
        <v-btn 
          @click="$emit('delete')"
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
  </div>
</template>

<script setup lang="ts">
import { 
  ref, 
  computed,
  watch,
  toRefs
} from 'vue'
import type { Ref } from 'vue'
import { 
  updateByRow, 
  moveRowToRange,
  Range, 
} from '../SheetsAPI'
import { 
  unmapGraduates, 
  unmapStudents, 
  mapGradEngagement,
  unmapGradEngagement
} from '../DataMappers'
import { useElementSize } from '@vueuse/core'
import { Graduate, GradEngagement } from '../SheetTypes'
import EngagementTracking from './EngagementTracking.vue'
import UpdateButton from './UpdateButton.vue'
import { emailValidator, phoneValidator } from '../EmailUtilities'

const props = defineProps<{
  item: Ref<Graduate>
}>()

const { item } = toRefs(props)

const emits = defineEmits([
  'delete', 
  'unselect',
  'update'
])

const sm = ref(false)
const el = ref(null)
const { width } = useElementSize(el)

watch(width, (newWidth) => {
  sm.value = newWidth < 700
}, { immediate: true })

const movingGrad = ref(false)
const showEngagementModal = ref(false)
const engagements = ref<GradEngagement[]>([])
const loadingEngagements = ref(true)
const selectedEngagement = ref<GradEngagement>(null)

const canDelete = computed(() => {
  return engagements.value.length === 0 && !loadingEngagements.value
})

function openModal(event: GradEngagement) {
  selectedEngagement.value = event
  showEngagementModal.value = true
}

async function reqGenerateGradId() {
  const newId = 'G' + Math.random().toString().substring(2, 9);
  item.value.id = newId
  await updateByRow(Range.GRADUATES, item.value.row, unmapGraduates([item.value]))
}

async function moveToStudents() {
  movingGrad.value = true
  await moveRowToRange(
    Range.GRADUATES,
    Range.STUDENTS,
    item.value.row,
    await unmapStudents([{
      row: item.value.row,
      id: item.value.id.startsWith('G') ? '' : item.value.id,
      name: item.value.name,
      email: item.value.email,
      points: 0,
      activeStatus: 'Active',
      year: '',
      athletics: '',
      note: item.value.note,
      misc: {}
    }])
  )
  emits('unselect')
}
</script>

<style scoped>
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