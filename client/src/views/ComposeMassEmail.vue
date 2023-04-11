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
        <h3>
          Where
        </h3>
        <v-select
          v-model="selectedHeader"
          :items="headerRow"
          :prepend-icon="selectedHeader ? 'mdi-check' : 'mdi-alert-circle-outline'"
          label="Criteria"
          variant="outlined"
          class="mt-3"
        ></v-select>
        <div v-if="selectedHeader">
          <div class="d-flex flex-row">
            <v-btn
              v-for="operand in ['= Equal To', '> Greater Than', '< Less Than']"
              :key="operand"
              @click="selectedOperand = operand[0]"
              :color="selectedOperand === operand[0] ? 'blue-darken-2' : 'grey'"
              size="small"
              class="mx-1"
            >{{ operand }}</v-btn>
          </div>
          <v-text-field
            v-model="quantity"
            :prepend-icon="quantity ? 'mdi-check' : 'mdi-alert-circle-outline'"
            label="Content"
            variant="outlined"
            class="mt-3"
          ></v-text-field>
        </div>
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
const selectedOperand = ref(null);
const quantity = ref("");

watch(selectedRange, async (newVal) => {
  selectedHeader.value = null;
  headerRow.value = await getHeaderRow(newVal.sheetRange);
}, { immediate: true });
</script>