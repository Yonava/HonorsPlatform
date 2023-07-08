<template>
  <DetailFrame v-model="completedModule.description">
    <template #main>
      <DetailHeader
        v-model="completedModule.courseCode"
        placeholder="Course Code"
      >
        <LinkStudentButton />
      </DetailHeader>

      <v-text-field
        v-model="completedModule.completedDate"
        label="Completed Date"
      >
        <template #prepend>
          <v-icon>mdi-check</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="completedModule.term"
        label="Term"
      >
        <template #prepend>
          <v-icon>mdi-calendar</v-icon>
        </template>
      </v-text-field>
      <InstructorComplete
        @update="completedModule.instructor = $event"
        :instructor="completedModule.instructor"
        color="red"
      />
      <v-text-field
        v-model="completedModule.instructor"
        label="Instructor"
      >
        <template #prepend>
          <v-icon>mdi-human-male-board</v-icon>
        </template>
      </v-text-field>
      <div class="d-flex flex-row">
        <v-text-field
          v-model="completedModule.docuSignCreated"
          class="mr-6"
          label="DocuSign Created"
        >
          <template #prepend>
            <v-icon>mdi-calendar-alert</v-icon>
          </template>
        </v-text-field>
        <v-text-field
          v-model="completedModule.docuSignCompleted"
          label="DocuSign Completed"
        >
          <template #prepend>
            <v-icon>mdi-calendar-check</v-icon>
          </template>
        </v-text-field>
      </div>
      <div class="d-flex flex-column align-center">
        <h2>
          Final Grade
        </h2>
        <input
          v-model="completedModule.grade"
          type="text"
          class="grade-input"
          placeholder="Grade"
          style="font-size: 5em; text-align: center;"
        >
      </div>
    </template>
  </DetailFrame>
</template>

<script setup lang="ts">
import DetailHeader from './Helper/DetailHeader.vue'
import InstructorComplete from './Helper/InstructorComplete.vue'
import DetailFrame from './Helper/DetailFrame.vue'
import LinkStudentButton from './Helper/LinkStudentButton.vue'

import { toRefs, Ref } from 'vue'
import type { CompletedModule } from '../../SheetTypes'
import { useDocumentCache } from '../../store/useDocumentCache'
import { useUpdateItem } from '../../TrackItemForUpdate'

const { "Completed Modules": CompletedModules } = useDocumentCache()
const { selected } = toRefs(CompletedModules)
const completedModule = selected as Ref<CompletedModule>
useUpdateItem(completedModule)
</script>

<style scoped>
input.grade-input {
  font-weight: 900;
  font-size: 3em;
  line-height: 0.9;
  width: 100%;
}

input.grade-input:focus {
  outline: none;
}
</style>