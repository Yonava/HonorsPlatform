<template>
  <DetailFrame
    v-model="grad.note"
    :disableDelete="!canDelete"
  >
    <template #main>
      <DetailHeader
        v-model="grad.name"
        :id="grad.id"
        placeholder="Name"
      >
        <template
          v-if="!grad.id"
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
          v-model="grad.email"
          :rules="[(v) => emailValidator(v) || 'Invalid email']"
          clearable
          label="Email"
          prepend-icon="mdi-email"
        ></v-text-field>
        <v-btn
          v-if="grad.email"
          @click="sendEmail(grad.email)"
          size="small"
          class="ml-4"
          color="purple-darken-2"
        >
          email
        </v-btn>
      </div>

      <v-text-field
        v-model="grad.phone"
        :rules="[(v) => phoneValidator(v) || 'Invalid phone number']"
        clearable
        label="Phone"
        prepend-icon="mdi-phone"
      ></v-text-field>

      <v-btn
        v-if="!grad.graduationDate"
        @click="grad.graduationDate = new Date().toLocaleString().split(',')[0]"
        size="x-small"
        color="purple-darken-2"
        class="mb-2"
      >Today</v-btn>
      <v-text-field
        v-model="grad.graduationDate"
        clearable
        label="Graduation Date"
        prepend-icon="mdi-calendar"
      ></v-text-field>

      <EngagementTracking
        @update="engagements = $event"
        @loading-state="loadingEngagements = $event"
        :id="grad.id"
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
import EngagementTracking from './Helper/EngagementTracking.vue'
import DetailHeader from './Helper/DetailHeader.vue'

import { ref, computed } from 'vue'
import { moveRowToRange, Range } from '../../SheetsAPI'
import { unmapStudents } from '../../DataMappers'
import type { GradEngagement } from '../../SheetTypes'
import { emailValidator, phoneValidator, sendEmail } from '../../EmailUtilities'

import { useSheetManager } from '../../store/useSheetManager'
import { storeToRefs } from 'pinia'
import { useUpdateItem } from '../../TrackItemForUpdate'

const sheetManager = useSheetManager()
const { selectedItem: grad } = storeToRefs(sheetManager)
useUpdateItem(grad)

const movingGrad = ref(false)

const engagements = ref<GradEngagement[]>([])
const loadingEngagements = ref(true)

const canDelete = computed(() => {
  return engagements.value.length === 0 && !loadingEngagements.value
})

async function generateGradId() {
  const newId = 'G' + Math.random().toString().substring(2, 9);
  grad.id = newId
}

async function moveToStudents() {
  movingGrad.value = true
  await moveRowToRange(
    Range.GRADUATES,
    Range.STUDENTS,
    grad.row,
    await unmapStudents([{
      row: grad.row,
      id: grad.id.startsWith('G') ? '' : grad.id,
      name: grad.name,
      email: grad.email,
      points: 0,
      activeStatus: 'Active',
      year: null,
      athletics: '',
      note: grad.note,
      misc: {}
    }])
  )

  sheetManager.setItem(null)
}
</script>