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
        @click="moveModuleBack"
        :color="modulePanel.color + '-darken-2'"
        :loading="movingModule"
        size="large"
      >
        <v-icon
          class="mr-2"
          size="x-large"
        >
          {{ modulePanel.icon }}
        </v-icon>
        Move Back to {{ modulePanel.title.plural }}
      </v-btn>
    </template>
  </DetailFrame>
</template>

<script setup lang="ts">
import DetailHeader from './Helper/DetailHeader.vue'
import InstructorComplete from './Helper/InstructorComplete.vue'
import DetailFrame from './Helper/DetailFrame.vue'
import LinkStudentButton from './Helper/LinkStudentButton.vue'
import type { CompletedModule, Module } from '../../SheetTypes'
import { useSheetManager } from '../../store/useSheetManager'
import { useDocumentCache } from '../../store/useDocumentCache'
import { useDialog } from '../../store/useDialog'
import { computed, ref } from 'vue'
import { useUpdateItem } from '../../TrackItemForUpdate'
import { getPanel } from '../../Panels'
import { warn } from '../../Warn'

const { getActivePanel, setPanel } = useSheetManager()
const { moveItemBetweenLists } = useDocumentCache()
const { open, close } = useDialog()

const props = defineProps<{
  item: CompletedModule
}>()

const movingModule = ref(false)

const completedModule = computed(() => props.item)
const modulePanel = getPanel('MODULES')

const moveModuleBack = async () => {
  movingModule.value = true
  const { grade, completedDate, ...rest } = completedModule.value
  const newItem: Module = rest;

  const title = completedModule.value[getActivePanel.properties.title] || `This ${getActivePanel.title.singular}`

  try {
    await warn({
      title: `Move ${title} Back to ${modulePanel.title.plural}?`,
      description: `Are you sure you want to move ${title.toLowerCase()} back to ${modulePanel.title.plural}? This action will remove the grade (${completedModule.value.grade || 'ungraded'}) and completed date (${completedModule.value.completedDate || 'no completion date'}) and cannot be undone.`,
    })
  } catch (e) {
    movingModule.value = false
    return
  }

  await moveItemBetweenLists({
    oldItem: completedModule.value,
    newItem,
    oldPanel: getActivePanel,
    newPanel: modulePanel,
  })

  open({
    body: {
      title: `${title} Moved Back Successfully`,
      description: `${title} has been moved back to ${modulePanel.title.plural}.`,
      buttons: [
        {
          text: 'Dismiss',
          color: 'red',
          onClick: () => close(),
        },
        {
          text: `View ${modulePanel.title.singular}`,
          color: `${modulePanel.color}-darken-2`,
          onClick: () => {
            setPanel(modulePanel.panelName, {
              value: newItem.sysId
            })
            close()
          },
        }
      ]
    },
  })

  movingModule.value = false
}

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