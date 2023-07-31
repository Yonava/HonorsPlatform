<template>
  <EmbeddedDetailFrame
    v-model="selectedModule.courseCode"
    @input="broadcastThroughSocket('courseCode')"
    titlePlaceholder="Course Code"
  >
    <v-btn
      v-if="!selectedModule.term"
      @click="
        selectedModule.term = getCurrentTerm();
        broadcastThroughSocket('term');
      "
      :color="getActiveEmbeddedPanel.color + '-darken-2'"
      size="x-small"
      class="mb-3"
    >Current Term</v-btn>
    <v-text-field
      v-model="selectedModule.term"
      @input="broadcastThroughSocket('term')"
      :rules="[(v) => termValidator(v) || 'Potentially invalid term']"
      label="Term"
      variant="outlined"
    ></v-text-field>
    <InstructorComplete
      @update="
        selectedModule.instructor = $event;
        broadcastThroughSocket('instructor')
      "
      :instructor="selectedModule.instructor"
      :color="getActiveEmbeddedPanel.color + '-darken-2'"
    />
    <v-text-field
      v-model="selectedModule.instructor"
      @input="broadcastThroughSocket('instructor')"
      label="Instructor"
      variant="outlined"
    ></v-text-field>
    <div class="d-flex flex-row mb-3">
      <v-btn
        v-if="!selectedModule.docuSignCreated"
        @click="
          selectedModule.docuSignCreated = new Date().toLocaleDateString('en-US');
          broadcastThroughSocket('docuSignCreated');
        "
        :color="getActiveEmbeddedPanel.color + '-darken-2'"
        size="x-small"
      >
        Created Now
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        v-if="!selectedModule.docuSignCompleted"
        @click="
          selectedModule.docuSignCompleted = new Date().toLocaleDateString('en-US');
          broadcastThroughSocket('docuSignCompleted');
        "
        :color="getActiveEmbeddedPanel.color + '-darken-2'"
        size="x-small"
      >
        Completed Now
      </v-btn>
    </div>
    <div class="d-flex flex-row">
      <v-text-field
        v-model="selectedModule.docuSignCreated"
        @input="broadcastThroughSocket('docuSignCreated')"
        label="DocuSign Created"
        variant="outlined"
        class="mr-5"
      ></v-text-field>
      <v-text-field
        v-model="selectedModule.docuSignCompleted"
        @input="broadcastThroughSocket('docuSignCompleted')"
        label="DocuSign Completed"
        variant="outlined"
      ></v-text-field>
    </div>
    <v-textarea
      v-model="selectedModule.description"
      @input="broadcastThroughSocket('description')"
      no-resize
      label="Description"
      variant="outlined"
    ></v-textarea>
    <template #right-button>
      <v-btn
        @click="openMoveDialog"
        variant="outlined"
        :color="getActiveEmbeddedPanel.color + '-darken-2'"
      >
        complete
      </v-btn>
    </template>
  </EmbeddedDetailFrame>
</template>

<script setup lang="ts">
import EmbeddedDetailFrame from '../EmbeddedDetailFrame.vue'
import { useSheetManager } from '../../../../store/useSheetManager'
import { computed } from 'vue'
import { useDialog } from '../../../../store/useDialog'
import { termValidator, getCurrentTerm } from '../../../../TermValidator'
import MoveModule from '../../Helper/MoveModule.vue'
import InstructorComplete from '../../Helper/InstructorComplete.vue'
import type { Module } from '../../../../SheetTypes'

const { getActiveEmbeddedPanel, focusedEmbeddedItem } = useSheetManager()
const selectedModule = computed(() => focusedEmbeddedItem as Module)

defineProps<{
  broadcastThroughSocket: (prop: keyof Module, value?: string | number | boolean) => void
}>()

const openMoveDialog = () => {
  useDialog().open({
    component: {
      render: MoveModule,
      props: {
        module: selectedModule.value,
      },
    },
  })
}
</script>