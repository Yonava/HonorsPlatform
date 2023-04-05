<template>
  <div 
    class="d-flex flex-row"
    style="width: 100%; padding: 20px"
  >
    <div style="width: 55%;">
      <p style="font-weight: 200">
        {{ item.value.studentId }}
      </p>
      <div class="d-flex flex-row align-center">
        <input 
          v-model="item.value.courseCode"
          placeholder="Course Code"
          type="text" 
          class="header-input"
        >
        <v-spacer></v-spacer>
        <update-button
          @updated="$emit('update', $event)"
          :item="item"
          itemName="Module"
        />
      </div>
      <v-divider class="my-2"></v-divider>
      <v-text-field
        v-model="item.value.completedDate"
        label="Completed Date"
      >
        <template #prepend>
          <v-icon>mdi-check</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="item.value.term"
        label="Term"
      >
        <template #prepend>
          <v-icon>mdi-calendar</v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="item.value.instructor"
        label="Instructor"
      >
        <template #prepend>
          <v-icon>mdi-human-male-board</v-icon>
        </template>
      </v-text-field>
      <div class="d-flex flex-row">
        <v-text-field
          v-model="item.value.docuSignCreated"
          class="mr-6"
          label="DocuSign Created"
        >
          <template #prepend>
            <v-icon>mdi-calendar-alert</v-icon>
          </template>
        </v-text-field>
        <v-text-field
          v-model="item.value.docuSignCompleted"
          label="DocuSign Completed"
        >
          <template #prepend>
            <v-icon>mdi-calendar-check</v-icon>
          </template>
        </v-text-field>
      </div>
      <div class="d-flex flex-column align-center justify-center">
        <h2>
          Final Grade
        </h2>
        <input 
          v-model="item.value.grade"
          type="text" 
          class="header-input" 
          placeholder="Grade"
          style="font-size: 5em; text-align: center;"
        >
      </div>
    </div>
    <div 
      style="width: 45%;" 
      class="ml-5 d-flex flex-column"
    >
      <span 
        @click="emits('delete')"
        class="delete d-flex align-center mb-2"
      >
        <v-icon>mdi-delete</v-icon>
        delete module permanently
      </span>
      <v-textarea
        v-model="item.value.description"
        clearable
        label="Description"
      ></v-textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
import { CompletedModule } from '../SheetTypes'
import UpdateButton from './UpdateButton.vue'

const props = defineProps<{
  item: Ref<CompletedModule>
}>()

const emits = defineEmits([
  'delete', 
  'update', 
  'unselect'
])
</script>

<style scoped>
.delete {
  color: red;
  cursor: pointer;
}

.delete:hover {
  text-decoration: underline;
}

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