<template>
  <v-sheet>
    <div class="ma-6 d-flex justify-center flex-column">
      <h1 class="mb-6">
        Let's Finish
        {{
          module[modulePanel.properties.title] ||
          `This ${modulePanel.title.singular}`
        }}
        Up!
      </h1>
      <v-text-field
        v-model="completedDate"
        label="Date Completed"
        variant="outlined"
        prepend-inner-icon="mdi-calendar"
      ></v-text-field>
      <div class="d-flex flex-column mb-12 mt-3 mx-12">
        <v-btn
          v-for="grade in grades"
          :key="grade || 'ungraded'"
          @click="finalGrade = grade"
          :color="grade === finalGrade ? color : 'grey'"
          class="mt-2"
          >{{ grade || "Leave Ungraded" }}</v-btn
        >
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
import { ref, onUnmounted } from "vue";
import type { Module } from "@apptypes/sheetItems";
import { Grade, grades } from "@apptypes/misc"
import { getPanel, panels } from "@panels";
import { useDocumentCache } from "@store/useDocumentCache";
import { useDialog } from "@store/useDialog";
import { useSheetManager } from "@store/useSheetManager";
import { useSyncState } from "@store/useSyncState";

const props = defineProps<{
  module: Module;
  resolve?: (reason?: string) => void;
  reject?: (reason?: any) => void;
}>();

const { module, resolve = null, reject = null } = props;

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
  const { moveItemBetweenLists } = useDocumentCache();
  const { setPanel } = useSheetManager();

  const { sysId } = module;
  const { waitUntilSynced } = useSyncState();

  loading.value = true;

  await waitUntilSynced({ showDialog: true });

  if (typeof module.row !== "number") {
    loading.value = false;
    if (reject) {
      reject("Module cannot be moved because it is not in the sheet.");
    }
    return useDialog().open({
      title: "Try Adding Something First",
      description: `You cannot complete a ${modulePanel.title.singular.toLowerCase()} with nothing on it 🤪. Play around with it, have fun, ENJOY LIFE, then come back when you are actually ready to move something!`,
      buttons: [
        {
          text: "Sounds Good",
          color: "blue",
          onClick: () => useDialog().close(),
        },
        {
          text: "Sounds Good (But In Pink ✨🦄✨)",
          color: "pink",
          onClick: () => {
            const panelKeys = Object.keys(panels);
            panelKeys.forEach((panel) => {
              panels[panel].color = "pink";

              panels["MODULES"].icon = "mdi-unicorn-variant";
              panels["STUDENTS"].icon = "mdi-butterfly";
              panels["GRADUATES"].icon = "mdi-heart";
              panels["THESES"].icon = "mdi-flower-tulip";
              panels["GRADUATE_ENGAGEMENTS"].icon = "mdi-candy";
              panels["COMPLETED_MODULES"].icon = "mdi-dolphin";
            });

            setPanel(modulePanel.panelName);

            useDialog().close();
          },
        },
      ],
    });
  }

  const newCompletedModule = {
    ...module,
    completedDate: completedDate.value,
    grade: finalGrade.value,
  };

  try {
    await moveItemBetweenLists({
      oldPanelName: modulePanel.panelName,
      newPanelName: completedModulePanel.panelName,
      item: newCompletedModule,
    });
  } catch (e) {
    console.error(e);
    await waitUntilSynced({ showDialog: true });
    loading.value = false;
    if (reject) {
      reject(`There was an error moving this module. ${e}`);
    }
    return useDialog().open({
      title: "Error",
      description: `There was an error moving this ${modulePanel.title.singular.toLowerCase()}. Please try again later.`,
    });
  }

  loading.value = false;
  if (resolve) {
    resolve();
  }

  useDialog().open({
    title: `${
      module[modulePanel.properties.title] || modulePanel.title.singular
    } Completed Successfully!`,
    description: `Moved ${newCompletedModule.courseCode} to ${
      completedModulePanel.title.plural
    } with a grade of ${newCompletedModule.grade || "ungraded"}.`,
    buttons: [
      {
        text: "OK",
        color: "success",
        onClick: () => {
          useDialog().close();
        },
      },
      {
        text: `View In ${completedModulePanel.title.plural}`,
        color: completedModulePanel.color,
        onClick: () => {
          setPanel(completedModulePanel.panelName, {
            value: sysId,
          });
          useDialog().close();
        },
      },
    ],
  });
}

onUnmounted(() => {
  if (reject) {
    reject("Module was not moved.");
  }
});
</script>