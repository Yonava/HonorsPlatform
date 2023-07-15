<template>
  <EmbeddedDetailFrame
    v-model="selectedModule.courseCode"
    titlePlaceholder="Course Code"
  >
    <v-btn
      v-if="!selectedModule.term"
      @click="selectedModule.term = getCurrentTerm()"
      :color="getActiveEmbeddedPanel.color + '-darken-2'"
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
      :color="getActiveEmbeddedPanel.color + '-darken-2'"
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
        :color="getActiveEmbeddedPanel.color + '-darken-2'"
        size="x-small"
      >Created Now</v-btn>
      <v-spacer></v-spacer>
      <v-btn
        v-if="!selectedModule.docuSignCompleted"
        @click="selectedModule.docuSignCompleted = new Date().toLocaleDateString()"
        :color="getActiveEmbeddedPanel.color + '-darken-2'"
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
    <template #right-button>
      <v-btn
        @click="openMoveDialog"
        variant="outlined"
        :color="getActiveEmbeddedPanel.color + '-darken-2'"
      >complete</v-btn>
    </template>
  </EmbeddedDetailFrame>
</template>

<script setup lang="ts">
import EmbeddedDetailFrame from '../EmbeddedDetailFrame.vue'
import { useSheetManager } from '../../../../store/useSheetManager'
import { useDocumentCache } from '../../../../store/useDocumentCache'
import { toRefs, computed } from 'vue'
import { useDialog } from '../../../../store/useDialog'
import { termValidator, getCurrentTerm } from '../../../../TermValidator'
import MoveModule from '../../Helper/MoveModule.vue'
import InstructorComplete from '../../Helper/InstructorComplete.vue'

const { getActiveEmbeddedPanel } = useSheetManager()
const { Modules } = useDocumentCache()
const { selected } = toRefs(Modules)

const selectedModule = computed(() => {
  return selected.value[0]
})

const openMoveDialog = () => {
  useDialog().open({
    component: MoveModule,
  })
}
</script>