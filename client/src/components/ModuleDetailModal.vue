<template>
  <v-dialog v-model="showDialog">
    <div 
      v-if="selectedModule"
      class="d-flex justify-center align-center"
      style="max-height: 80%; overflow: auto"
    >
      <v-card
        class="module-card pa-5"
        width="500"
      >
        <v-sheet 
          class="py-2 px-4 d-flex align-center"
          color="blue-darken-2"
          style="font-weight: bold; color: white; border-radius: 20px; width: 120%"
        >
          <v-icon class="mr-1">mdi-file-document-edit-outline</v-icon>
          <span>Edit Module</span>
        </v-sheet>
        <input 
          type="text"
          v-model="selectedModule.courseCode"
          placeholder="Course Code"
          class="course-code mt-2"
        >
        <div>
          <v-text-field
            v-model="selectedModule.term"
            :rules="[(v) => termValidator(v) || 'Potentially invalid term']"
            label="Term"
            variant="outlined"
          ></v-text-field>
          <v-text-field
            v-model="selectedModule.instructor"
            label="Instructor"
            variant="outlined"
          ></v-text-field>
          <div class="d-flex flex-row mb-3">
            <v-btn 
              v-if="!selectedModule.docuSignCreated"
              @click="selectedModule.docuSignCreated = new Date().toLocaleDateString()"
              color="blue"
              size="x-small"
            >Created Now</v-btn>
            <v-spacer></v-spacer>
            <v-btn 
              v-if="!selectedModule.docuSignCompleted"
              @click="selectedModule.docuSignCompleted = new Date().toLocaleDateString()"
              color="blue"
              size="x-small"
            >Completed Now</v-btn>
          </div>
          <div class="d-flex flex-row">
            <v-text-field
              v-model="selectedModule.docuSignCreated"
              label="DocuSign Created"
              variant="outlined"
              class="mr-5"
            ></v-text-field>
            <v-text-field
              v-model="selectedModule.docuSignCompleted"
              label="DocuSign Completed"
              variant="outlined"
            ></v-text-field>
          </div>
          <v-textarea
            v-model="selectedModule.description"
            label="Description"
            variant="outlined"
          ></v-textarea>
        </div>
        <v-card-actions>
          <v-btn
            @click="update"
            color="green"
            filled
          >update</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            @click="emits('close')"
            color="red"
          >discard changes</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { Module } from '../SheetTypes'
import { termValidator } from '../TermValidator'

const props = defineProps<{
  module: Module
  show: boolean
}>()

const selectedModule = ref<Module>(null)
const startingState = ref<Module>(null)
const clone = <T>(obj: T) => JSON.parse(JSON.stringify(obj))

watch(() => props.show, (val) => {
  if (val) {
    startingState.value = clone(props.module)
    selectedModule.value = clone(props.module)
  }
})

function update() {
  if (JSON.stringify(selectedModule.value) === JSON.stringify(startingState.value)) {
    emits('close')
    return
  }
  emits('update', selectedModule.value)
}

const showDialog = computed({
  get: () => props.show,
  set: (val) => emits('close')
})

const emits = defineEmits([
  'close', 
  'update'
])
</script>

<style scoped>
input.course-code {
  font-size: 3rem;
  font-weight: 900;
  border: none;
  outline: none;
  width: 100%;
  margin-bottom: 1rem;
}
</style>