<template>
  <ModalContent v-model="showDialog">
    <div
      v-if="selectedModule"
      class="d-flex justify-center align-center"
    >
      <v-card
        class="pa-5"
        :width="xs ? '100%' : '550'"
        elevation="0"
      >
        <v-sheet
          class="py-2 px-4 d-flex align-center"
          color="blue-darken-2"
          style="font-weight: bold; color: white; border-radius: 20px; width: 120%"
        >
          <v-icon class="mr-1">mdi-file-document-edit-outline</v-icon>
          <span>
            {{ newModule ? 'Create' : 'Update' }} Module
          </span>
        </v-sheet>
        <input
          type="text"
          v-model="selectedModule.courseCode"
          placeholder="Course Code"
          class="course-code mt-2"
        >
        <div>
          <v-btn
            v-if="!selectedModule.term"
            @click="selectedModule.term = getCurrentTerm()"
            color="blue"
            size="x-small"
            class="mb-3"
          >Current Term</v-btn>
          <v-text-field
            v-model="selectedModule.term"
            :rules="[(v) => termValidator(v) || 'Potentially invalid term']"
            label="Term"
            variant="outlined"
          ></v-text-field>
          <InstructorComplete
            @update="selectedModule.instructor = $event"
            :instructor="selectedModule.instructor"
            color="blue"
          />
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
            no-resize
            v-model="selectedModule.description"
            label="Description"
            variant="outlined"
          ></v-textarea>
        </div>
        <v-card-actions class="pa-0">
          <v-btn
            @click="update"
            color="green"
            variant="outlined"
          >
            {{ newModule ? 'create' : 'update' }}
          </v-btn>
          <v-btn
            v-if="xs && !newModule"
            @click="emits('close')"
            color="red"
            variant="outlined"
          >close</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            v-if="!newModule"
            @click="showCompleteModal = true"
            variant="outlined"
            color="blue"
          >complete</v-btn>
          <v-btn
            v-else
            @click="emits('close')"
            variant="outlined"
            color="red"
          >discard</v-btn>
        </v-card-actions>
      </v-card>
    </div>
    <FinishModuleModal
      @success="emits('close')"
      @close="showCompleteModal = false"
      :show="showCompleteModal"
      :module="selectedModule"
      color="blue-darken-2"
    />
  </ModalContent>
</template>

<script setup lang="ts">
import { watch, ref, computed } from 'vue'
import { Module } from '../../../SheetTypes'
import { useDisplay } from 'vuetify'
import { termValidator, getCurrentTerm } from '../../../TermValidator'
import FinishModuleModal from './FinishModuleModal.vue'
import ModalContent from '../../ModalContent.vue'
import InstructorComplete from './InstructorComplete.vue'

const props = defineProps<{
  module: Module | undefined
  show: boolean
}>()

const emits = defineEmits([
  'close',
  'update'
])

const selectedModule = ref<Module>(null)
const startingState = ref<Module>(null)
const showCompleteModal = ref(false)
const newModule = ref(false)

const clone = <T>(obj: T) => JSON.parse(JSON.stringify(obj))

const { xs } = useDisplay()

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
  get: () => {
    if (props.show && props.module) {
      newModule.value = props.module.row === null
    }
    return props.show
  },
  set: (val) => emits('close')
})
</script>

<style scoped>
input.course-code {
  font-weight: 900;
  border: none;
  outline: none;
  width: 100%;
  margin-bottom: 1rem;
  font-size: 3rem;
}
</style>