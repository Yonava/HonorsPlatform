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
        :color="color"
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
          :color="color"
          size="x-small"
        >Now</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!module.docuSignCompleted"
          @click="module.docuSignCompleted = new Date().toLocaleDateString()"
          :color="color"
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
    </template>
    <template #buttons>
      <v-btn
        @click="moveModule"
        :color="color"
        size="large"
      >
        <v-icon
          class="mr-2"
          size="x-large"
        >
          {{ completedModulesPanel.icon }}
        </v-icon>
        Complete Module
      </v-btn>
    </template>
  </DetailFrame>
</template>

<script setup lang="ts">
import DetailHeader from './Helper/DetailHeader.vue'
import MoveModule from './Helper/MoveModule.vue'
import InstructorComplete from './Helper/InstructorComplete.vue'
import DetailFrame from './Helper/DetailFrame.vue'

import { ref, toRefs } from 'vue'
import { termValidator } from '../../TermValidator'
import { getPanel } from '../../Panels'

import { useUpdateItem } from '../../TrackItemForUpdate'
import { useDialog } from '../../store/useDialog'
import { useDocumentCache } from '../../store/useDocumentCache'

const { Modules, addItemToCache, setSelectedItem } = useDocumentCache();
const completedModulesPanel = getPanel('COMPLETED_MODULES')
const modulesPanel = getPanel('MODULES')

const color = modulesPanel.color + '-darken-2'

const { selected: module } = toRefs(Modules);
useUpdateItem(module)

const moveModule = () => {
  useDialog().open({
    component: MoveModule,
  })
}
</script>