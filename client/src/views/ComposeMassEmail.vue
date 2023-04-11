<template> 
  <v-sheet 
    color="blue-darken-2"
    style="height: 100vh; width: 100vw;"
    class="d-flex flex-column align-center justify-center"
  >
    <v-sheet 
      class="pa-7 d-flex flex-column align-center justify-center"
      style="border-radius: 20px;"
      elevation="7"
    >
      <h1>
        Compose Mass Email
      </h1>
      <div style="width: 400px">
        <h3>
          Target All
        </h3>
        <v-select
          v-model="selectedRange"
          :items="panels"
          :prepend-icon="selectedRange.icon"
          item-title="title.plural"
          return-object
          label="Group"
          variant="outlined"
          class="mt-3"
        ></v-select>
        Where
        <v-select
          v-model="selectedHeader"
          :items="panels"
          :prepend-icon="selectedRange.icon"
          item-title="title.plural"
          return-object
          label="Group"
          variant="outlined"
          class="mt-3"
        ></v-select>
      </div>
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { switchPanel, Panel, PanelType } from "../SwitchPanel";
import { getHeaderRow } from "../SheetsAPI";

const panels = Object.values(PanelType).map((panel) => switchPanel(panel));
const selectedRange = ref(panels[0]);
const headerRow = ref([]);
const selectedHeader = ref(null);

watch(selectedRange, async (newVal) => {
  headerRow.value = await getHeaderRow(newVal.sheetRange);
}, { immediate: true });
</script>