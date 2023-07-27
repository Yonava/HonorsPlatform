<template>
  <DetailFrame
    v-model="module.description"
    :item="module"
  >
    <template #main>
      <DetailHeader
        v-model="module.courseCode"
        :item="module"
        placeholder="Course Code"
      >
        <LinkStudentButton
          :item="module"
        />
      </DetailHeader>
      <v-btn
        v-if="!module.term"
        @click="module.term = getCurrentTerm()"
        :color="color"
        size="x-small"
        class="mb-3"
      >Current Term</v-btn>
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
          prepend-icon="mdi-calendar-alert"
          style="width: 45%"
          class="mr-6"
          label="DocuSign Created"
        ></v-text-field>
        <v-text-field
          v-model="module.docuSignCompleted"
          style="width: 45%"
          prepend-icon="mdi-calendar-check"
          label="DocuSign Completed"
        ></v-text-field>
      </div>
    </template>
    <template #buttons>
      <v-btn
        @click="moveItem(module)"
        :loading="movingItem"
        :color="color"
        size="large"
      >
        <v-icon
          class="mr-2"
          size="x-large"
        >
          {{ panelOnceMoved.icon }}
        </v-icon>
        Complete Module
      </v-btn>
    </template>
  </DetailFrame>
</template>

<script setup lang="ts">
import DetailHeader from './Helper/DetailHeader.vue'
import InstructorComplete from './Helper/InstructorComplete.vue'
import DetailFrame from './Helper/DetailFrame.vue'
import LinkStudentButton from './Helper/LinkStudentButton.vue'

import { computed } from 'vue'
import type { Module } from '../../SheetTypes'
import { termValidator, getCurrentTerm } from '../../TermValidator'
import { getPanel } from '../../Panels'
import { useMoveItem } from '../../MoveItems'
import { useUpdateItem } from '../../TrackItemForUpdate'

const modulesPanel = getPanel('MODULES')

const color = modulesPanel.color + '-darken-2'

const props = defineProps<{
  item: Module
}>()

const module = computed(() => props.item)

useUpdateItem(module)

const { moveItem, movingItem, panelOnceMoved } = useMoveItem()
</script>