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
            Modules {{ selectedModule.row || 'no row' }}
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
            @click="showDialog = false"
            color="red"
            variant="outlined"
          >
            close
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            @click="openMoveDialog"
            variant="outlined"
            color="blue"
          >complete</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </ModalContent>
</template>

<script setup lang="ts">
import { watch, ref, computed, toRefs } from 'vue'
import { Module } from '../../../../SheetTypes'
import { panels } from '../../../../Panels'
import { useDocumentCache } from '../../../../store/useDocumentCache'
import { useDisplay } from 'vuetify'
import { useDialog } from '../../../../store/useDialog'
import { useUpdateItem } from '../../../../TrackItemForUpdate'
import { termValidator, getCurrentTerm } from '../../../../TermValidator'
import MoveModule from '../../Helper/MoveModule.vue'
import ModalContent from '../../../ModalContent.vue'
import InstructorComplete from '../../Helper/InstructorComplete.vue'

const modulePanel = panels['MODULES']
const { Modules, setSelectedItem, updateItem } = useDocumentCache()
const { selected: selectedModule } = toRefs(Modules)
useUpdateItem(selectedModule, modulePanel)

const { xs } = useDisplay()

const dialogCanOpen = ref(true)
const showDialog = computed({
  get: () => !!selectedModule.value && dialogCanOpen.value,
  set: () => {
    dialogCanOpen.value = false
    setTimeout(() => {
      setSelectedItem({ panel: modulePanel })
      dialogCanOpen.value = true
    }, 300)
  }
})

const openMoveDialog = () => {
  useDialog().open({
    component: MoveModule,
  })
}
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