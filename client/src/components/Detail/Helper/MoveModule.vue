<template>
  <v-sheet class="px-12">
    <div class="ma-6 d-flex justify-center flex-column">
      <h1 class="mb-6">
        Let's Finish It Up!
      </h1>
        <v-text-field
          v-model="completedDate"
          clearable
          label="Date Completed"
          variant="outlined"
          prepend-inner-icon="mdi-calendar"
        ></v-text-field>
        <div class="d-flex flex-column mb-12 mt-3">
          <v-btn
            v-for="grade in grades"
            :key="grade"
            @click="finalGrade = grade"
            :color="grade === finalGrade ? color : 'grey'"
            class="mt-2"
          >{{ grade || "Leave Ungraded" }}</v-btn>
        </div>
        <v-btn
        @click="moveModule"
        :loading="loading"
        :color="color"
        size="large"
      >
        <v-icon class="mr-2">
          {{ completedModulePanel.icon }}
        </v-icon>
        Move To Completed Modules
      </v-btn>
      </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { Grade, grades, Module } from "../../../SheetTypes";
import { ref, computed } from "vue";
import { getPanel } from "../../../Panels";
import { useDocumentCache } from '../../../store/useDocumentCache'
import { useDialog } from '../../../store/useDialog'
import { useSheetManager } from '../../../store/useSheetManager'

const modulePanel = getPanel("MODULES");
const completedModulePanel = getPanel("COMPLETED_MODULES");
const color = completedModulePanel.color;
const loading = ref(false);

const newDateString = () => {
  return new Date().toLocaleDateString();
};

const completedDate = ref(newDateString());
const finalGrade = ref<Grade>(null);

async function moveModule() {
  loading.value = true;
  const { moveItemBetweenLists, getSelectedItem } = useDocumentCache()
  const { setPanel } = useSheetManager()
  const selectedModule = getSelectedItem(modulePanel) as Module;
  const { sysId } = selectedModule;

  const newCompletedModule = {
    ...selectedModule,
    completedDate: completedDate.value,
    grade: finalGrade.value,
  }


  await moveItemBetweenLists(
    selectedModule,
    newCompletedModule,
    modulePanel,
    completedModulePanel
  )

  useDialog().open({
    body: {
      title: "Module Completed Successfully!",
      description: `Moved ${newCompletedModule.courseCode} to completed modules
          with a grade of ${newCompletedModule.grade || "ungraded"}.
          This module is now accessible through the completed modules tab.`,
      buttons: [
        {
          text: "OK",
          color: "success",
          onClick: () => {
            useDialog().close()
          }
        },
        {
          text: "View In Completed Modules",
          color: completedModulePanel.color,
          onClick: () => {
            setPanel(completedModulePanel, {
              value: sysId
            })
            useDialog().close()
          }
        }
      ]
    }
  })
}
</script>