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
        placeholder="Name"
      >
        <template 
          v-if="!item.id"
          #id
        >
          <v-btn
            @click="reqGenerateGradId"
            size="x-small"
            color="purple-darken-2"
          >
            Generate Grad ID
          </v-btn>
        </template>
      </DetailHeader>

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
import { ref, computed, watch } from 'vue'
import { moveRowToRange, Range } from '../SheetsAPI'
import { unmapStudents } from '../DataMappers'
import { useElementSize } from '@vueuse/core'
import { Graduate, GradEngagement } from '../SheetTypes'
import EngagementTracking from './EngagementTracking.vue'
import DetailHeader from './DetailHeader.vue'
import { emailValidator, phoneValidator } from '../EmailUtilities'

const props = defineProps<{
  item: Graduate
}>()

const emits = defineEmits([
  'delete', 
  'unselect'
])

const sm = ref(false)
const el = ref(null)
const { width } = useElementSize(el)

watch(width, (newWidth) => {
  sm.value = newWidth < 700
}, { immediate: true })

const movingGrad = ref(false)

const engagements = ref<GradEngagement[]>([])
const loadingEngagements = ref(true)

const canDelete = computed(() => {
  return engagements.value.length === 0 && !loadingEngagements.value
})

async function reqGenerateGradId() {
  const newId = 'G' + Math.random().toString().substring(2, 9);
  props.item.id = newId
}

async function moveToStudents() {
  movingGrad.value = true
  await moveRowToRange(
    Range.GRADUATES,
    Range.STUDENTS,
    props.item.row,
    await unmapStudents([{
      row: props.item.row,
      id: props.item.id.startsWith('G') ? '' : props.item.id,
      name: props.item.name,
      email: props.item.email,
      points: 0,
      activeStatus: 'Active',
      year: '',
      athletics: '',
      note: props.item.note,
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