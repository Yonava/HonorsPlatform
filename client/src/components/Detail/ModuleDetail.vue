<template>
  <DetailFrame
    v-model="item.description"
    @delete="$emit('delete')"
  >
    <template #main>
      <DetailHeader
        v-model="item.courseCode"
        :id="item.studentId"
        placeholder="Course Code"
      />

      <v-text-field
        v-model="item.term"
        :rules="[(v) => termValidator(v) || 'Potentially invalid term']"
        prepend-icon="mdi-calendar"
        label="Term"
      ></v-text-field>
      <InstructorComplete
        @update="item.instructor = $event"
        :instructor="item.instructor"
        color="orange-darken-2"
      />
      <v-text-field
        v-model="item.instructor"
        label="Instructor"
        prepend-icon="mdi-human-male-board"
      ></v-text-field>

      <h1 class="mb-2">
        Documentation
      </h1>

      <div class="d-flex flex-row mb-2">
        <v-btn
          v-if="!item.docuSignCreated"
          @click="item.docuSignCreated = new Date().toLocaleDateString()"
          color="orange-darken-2"
          size="x-small"
        >Now</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!item.docuSignCompleted"
          @click="item.docuSignCompleted = new Date().toLocaleDateString()"
          color="orange-darken-2"
          size="x-small"
        >Now</v-btn>
      </div>

      <div class="d-flex flex-row">
        <v-text-field
          v-model="item.docuSignCreated"
          clearable
          prepend-icon="mdi-calendar-alert"
          style="width: 45%"
          class="mr-6"
          label="DocuSign Created"
        ></v-text-field>
        <v-text-field
          v-model="item.docuSignCompleted"
          clearable
          style="width: 45%"
          prepend-icon="mdi-calendar-check"
          label="DocuSign Completed"
        ></v-text-field>
      </div>

      <FinishModuleModal
        @success="emits('unselect')"
        @close="moveModuleDialog = false"
        :show="moveModuleDialog"
        :module="item"
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
import { ref } from 'vue'
import { termValidator } from '../../TermValidator'
import type { Module } from '../../SheetTypes'
import DetailHeader from './Helper/DetailHeader.vue'
import FinishModuleModal from './Helper/FinishModuleModal.vue'
import InstructorComplete from './Helper/InstructorComplete.vue'
import DetailFrame from './Helper/DetailFrame.vue'

const props = defineProps<{
  item: Module
}>()

const emits = defineEmits([
  'delete',
  'unselect'
])

const moveModuleDialog = ref(false)
</script>