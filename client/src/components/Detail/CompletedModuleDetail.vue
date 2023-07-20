<template>
  <DetailFrame
    v-model="completedModule.description"
    :item="completedModule"
  >
    <template #main>
      <DetailHeader
        v-model="completedModule.courseCode"
        :item="completedModule"
        placeholder="Course Code"
      >
        <LinkStudentButton
          :item="completedModule"
        />
      </DetailHeader>

      <v-text-field
        v-model="completedModule.completedDate"
        label="Completed Date"
        prepend-icon="mdi-check"
      ></v-text-field>
      <v-text-field
        v-model="completedModule.term"
        label="Term"
        prepend-icon="mdi-calendar"
      ></v-text-field>
      <InstructorComplete
        @update="completedModule.instructor = $event"
        :instructor="completedModule.instructor"
        :color="getActivePanel.color"
      />
      <v-text-field
        v-model="completedModule.instructor"
        label="Instructor"
        prepend-icon="mdi-human-male-board"
      ></v-text-field>
      <div class="d-flex flex-row">
        <v-text-field
          v-model="completedModule.docuSignCreated"
          class="mr-6"
          label="DocuSign Created"
          prepend-icon="mdi-calendar-alert"
        ></v-text-field>
        <v-text-field
          v-model="completedModule.docuSignCompleted"
          label="DocuSign Completed"
          prepend-icon="mdi-calendar-check"
        ></v-text-field>
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
    <template #buttons>
      <v-btn
        @click="moveItem(completedModule)"
        :color="panelOnceMoved.color + '-darken-2'"
        :loading="movingItem"
        size="large"
      >
        <v-icon
          class="mr-2"
          size="x-large"
        >
          {{ panelOnceMoved.icon }}
        </v-icon>
        Move Back to {{ panelOnceMoved.title.plural }}
      </v-btn>
    </template>
  </DetailFrame>
</template>

<script setup lang="ts">
import DetailHeader from './Helper/DetailHeader.vue'
import InstructorComplete from './Helper/InstructorComplete.vue'
import DetailFrame from './Helper/DetailFrame.vue'
import LinkStudentButton from './Helper/LinkStudentButton.vue'
import type { CompletedModule } from '../../SheetTypes'
import { useSheetManager } from '../../store/useSheetManager'
import { useMoveItem } from '../../MoveItems'
import { computed } from 'vue'
import { useUpdateItem } from '../../TrackItemForUpdate'

const { getActivePanel } = useSheetManager()

const props = defineProps<{
  item: CompletedModule
}>()

const completedModule = computed(() => props.item)

const { moveItem, movingItem, panelOnceMoved } = useMoveItem()

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