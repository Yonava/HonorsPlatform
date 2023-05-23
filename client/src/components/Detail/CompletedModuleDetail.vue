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
        v-model="item.completedDate"
        label="Completed Date"
      >
        <template #prepend>
          <v-icon>mdi-check</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="item.term"
        label="Term"
      >
        <template #prepend>
          <v-icon>mdi-calendar</v-icon>
        </template>
      </v-text-field>
      <InstructorComplete
        @update="item.instructor = $event"
        :instructor="item.instructor"
        color="red"
      />
      <v-text-field
        v-model="item.instructor"
        label="Instructor"
      >
        <template #prepend>
          <v-icon>mdi-human-male-board</v-icon>
        </template>
      </v-text-field>
      <div class="d-flex flex-row">
        <v-text-field
          v-model="item.docuSignCreated"
          class="mr-6"
          label="DocuSign Created"
        >
          <template #prepend>
            <v-icon>mdi-calendar-alert</v-icon>
          </template>
        </v-text-field>
        <v-text-field
          v-model="item.docuSignCompleted"
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
          v-model="item.grade"
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
import type { CompletedModule } from '../../SheetTypes'
import DetailHeader from './Helper/DetailHeader.vue'
import InstructorComplete from './Helper/InstructorComplete.vue'
import DetailFrame from './Helper/DetailFrame.vue'

const props = defineProps<{
  item: CompletedModule
}>()

const emits = defineEmits([
  'delete',
  'unselect'
])
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