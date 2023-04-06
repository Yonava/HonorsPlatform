<template>
  <div 
    :class="[
      'pa-5',
      'd-flex',
      sm ? 'flex-column' : 'flex-row'
    ]"
    style="width: 100%;"
    id="parent-wrapper"
  >
    <div>
      <p 
        v-if="item.value.id"
        style="font-weight: 200"
      >
        {{ item.value.id }}
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
          v-model="item.value.name"
          placeholder="Name"
          type="text" 
          class="header-input"
        >
        <v-spacer></v-spacer>
        <update-button
          @updated="$emit('update', $event)"
          :item="item"
          itemName="Grad"
        />
      </div>
      <v-divider class="my-2"></v-divider>
      <v-text-field
        v-model="item.value.email"
        label="Email"
      >
        <template #prepend>
          <v-icon>mdi-email</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="item.value.phone"
        label="Phone"
      >
        <template #prepend>
          <v-icon>mdi-phone</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="item.value.graduationDate"
        label="Graduation Date"
      >
        <template #prepend>
          <v-icon>mdi-calendar</v-icon>
        </template>
      </v-text-field>
      <EngagementTracking 
        @update="engagements = $event"
        :id="item.value.id"
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
          v-model="item.value.note"
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
          delete {{ item.value.name.split(' ')[0] }}
        </v-btn>
      </div>
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
import type { Ref } from 'vue'
import { 
  updateByRow, 
  moveRowToRange,
  postInRange,
  clearByRow,
  Range, 
  getEvery
} from '../SheetsAPI'
import { 
  unmapGraduates, 
  unmapStudents, 
  mapGradEngagement,
  unmapGradEngagement
} from '../DataMappers'
import { Graduate, GradEngagement } from '../SheetTypes'
import EngagementTracking from './EngagementTracking.vue'
import UpdateButton from './UpdateButton.vue'

const props = defineProps<{
  item: Ref<Graduate>
}>()

const emits = defineEmits([
  'delete', 
  'unselect',
  'update'
])

const sm = ref(false)

onMounted(() => {
  const parentWidth = document.getElementById('parent-wrapper').clientWidth
  sm.value = parentWidth < 700
})

const movingGrad = ref(false)
const showEngagementModal = ref(false)
const engagements = ref<GradEngagement[]>([])
const loadingEngagements = ref(true)
const selectedEngagement = ref<GradEngagement>(null)

const canDelete = computed(() => {
  return engagements.value.length === 0 && !loadingEngagements
})

function openModal(event: GradEngagement) {
  selectedEngagement.value = event
  showEngagementModal.value = true
}

async function reqGenerateGradId() {
  const newId = 'G' + Math.random().toString().substring(2, 9);
  props.item.value.id = newId
  await updateByRow(Range.GRADUATES, props.item.value.row, unmapGraduates([props.item.value]))
}

async function moveToStudents() {
  movingGrad.value = true
  await moveRowToRange(
    Range.GRADUATES,
    Range.STUDENTS,
    props.item.value.row,
    await unmapStudents([{
      row: props.item.value.row,
      id: props.item.value.id.startsWith('G') ? '' : props.item.value.id,
      name: props.item.value.name,
      email: props.item.value.email,
      points: 0,
      activeStatus: 'Active',
      year: '',
      athletics: '',
      note: props.item.value.note,
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