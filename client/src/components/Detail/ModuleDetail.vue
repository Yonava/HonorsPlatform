<template>
  <DetailFrame v-model="module.description">
    <template #main>
      <DetailHeader
        v-model="module.courseCode"
        :id="module.studentId"
        placeholder="Course Code"
      />

      <v-text-field
        v-model="module.term"
        :rules="[(v) => termValidator(v) || 'Potentially invalid term']"
        prepend-icon="mdi-calendar"
        label="Term"
      ></v-text-field>
      <InstructorComplete
        @update="module.instructor = $event"
        :instructor="module.instructor"
        color="orange-darken-2"
      />
      <v-text-field
        v-model="module.instructor"
        label="Instructor"
        prepend-icon="mdi-human-male-board"
      ></v-text-field>

      <h1 class="mb-2">
        Documentation
      </h1>

      <div class="d-flex flex-row mb-2">
        <v-btn
          v-if="!module.docuSignCreated"
          @click="module.docuSignCreated = new Date().toLocaleDateString()"
          color="orange-darken-2"
          size="x-small"
        >Now</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!module.docuSignCompleted"
          @click="module.docuSignCompleted = new Date().toLocaleDateString()"
          color="orange-darken-2"
          size="x-small"
        >Now</v-btn>
      </div>

      <div class="d-flex flex-row">
        <v-text-field
          v-model="module.docuSignCreated"
          clearable
          prepend-icon="mdi-calendar-alert"
          style="width: 45%"
          class="mr-6"
          label="DocuSign Created"
        ></v-text-field>
        <v-text-field
          v-model="module.docuSignCompleted"
          clearable
          style="width: 45%"
          prepend-icon="mdi-calendar-check"
          label="DocuSign Completed"
        ></v-text-field>
      </div>

      <FinishModuleModal
        @success="fetchItems"
        @close="moveModuleDialog = false"
        :show="moveModuleDialog"
        :module="module"
      />
    </template>
    <template #buttons>
      <v-btn
        @click="moveModuleDialog = true"
        color="orange-darken-2"
        size="large"
      >
        <v-icon
          class="mr-2"
          size="x-large"
        >mdi-check</v-icon>
        Mark Module As Completed
      </v-btn>
    </template>
  </DetailFrame>
</template>

<script setup lang="ts">
import DetailHeader from './Helper/DetailHeader.vue'
import FinishModuleModal from './Helper/FinishModuleModal.vue'
import InstructorComplete from './Helper/InstructorComplete.vue'
import DetailFrame from './Helper/DetailFrame.vue'

import { ref } from 'vue'
import { termValidator } from '../../TermValidator'
import type { Module } from '../../SheetTypes'

import { useSheetManager } from '../../store/useSheetManager'
import { storeToRefs } from 'pinia'
import { useUpdateItem } from '../../TrackItemForUpdate'

const sheetManager = useSheetManager()
const { fetchItems } = sheetManager
const { selectedItem: module } = storeToRefs(sheetManager)
useUpdateItem(module)

const moveModuleDialog = ref(false)
</script>