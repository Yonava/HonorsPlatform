<template>
  <DetailFrame
    v-model="item.note"
    @delete="$emit('delete')"
    :disableDelete="!canDelete"
  >
    <template #main>
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
            @click="generateGradId"
            size="x-small"
            color="purple-darken-2"
          >
            Generate Grad ID
          </v-btn>
        </template>
      </DetailHeader>

      <div class="d-flex align-center">
        <v-text-field
          v-model="item.email"
          :rules="[(v) => emailValidator(v) || 'Invalid email']"
          clearable
          label="Email"
          prepend-icon="mdi-email"
        ></v-text-field>
        <v-btn
          v-if="item.email"
          @click="sendEmail(item.email)"
          size="small"
          class="ml-4"
          color="purple-darken-2"
        >
          email
        </v-btn>
      </div>

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
    </template>
    <template #buttons>
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
    </template>
  </DetailFrame>
</template>

<script setup lang="ts">
import DetailFrame from './Helper/DetailFrame.vue'
import { ref, computed } from 'vue'
import { moveRowToRange, Range } from '../../SheetsAPI'
import { unmapStudents } from '../../DataMappers'
import type { Graduate, GradEngagement } from '../../SheetTypes'
import EngagementTracking from './Helper/EngagementTracking.vue'
import DetailHeader from './Helper/DetailHeader.vue'
import { emailValidator, phoneValidator, sendEmail } from '../../EmailUtilities'

const props = defineProps<{
  item: Graduate
}>()

const emits = defineEmits<{
  delete: () => void,
  unselect: () => void
}>()

const movingGrad = ref(false)

const engagements = ref<GradEngagement[]>([])
const loadingEngagements = ref(true)

const canDelete = computed(() => {
  return engagements.value.length === 0 && !loadingEngagements.value
})

async function generateGradId() {
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
      year: null,
      athletics: '',
      note: props.item.note,
      misc: {}
    }])
  )
  // @ts-ignore
  emits('unselect')
}
</script>