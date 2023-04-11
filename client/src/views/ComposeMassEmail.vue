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
            class="mt-6"
          ></v-text-field>
          
        </div>
        <div style="position: relative">
          <v-progress-linear
            v-if="loading"
            indeterminate
            color="blue-darken-2"
            style="position: absolute;"
          ></v-progress-linear>
          <h3 
            :style="{
              opacity: loading ? 0 : 1,
              textAlign: 'center'
            }"
            class="mt-2"
          >
            Your Query Captures {{ emails.length }} 
            Email Address{{ emails.length === 1 ? '' : 'es' }}
          </h3>
          <div
            class="px-1 email-box"
            :style="{
              opacity: loading ? 0.25 : 1
            }"
          >
            <v-chip
              v-for="email in emails"
              :key="email"
              color="blue-darken-4"
              class="my-1 mr-1"
            >
              {{ email }}
            </v-chip>
          </div>
        </div>
      </div>
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { switchPanel, Panel, PanelType } from "../SwitchPanel";
import { Student, Graduate, Module, CompletedModule, Thesis } from "../SheetTypes";
import { getHeaderRow, getEvery, Range } from "../SheetsAPI";
import { 
  mapStudents,
  mapGraduates,
  mapModules,
  mapCompletedModules,
  mapTheses
} from "../DataMappers";

const panels = Object.values(PanelType).map((panel) => switchPanel(panel));
const selectedRange = ref(panels[0]);
const headerRow = ref([]);
const selectedHeader = ref(null);
const selectedOperand = ref("=");
const quantity = ref("");
const data = ref([])
const loading = ref(false);

watch(selectedRange, async (newVal) => {
  selectedHeader.value = null;
  headerRow.value = await getHeaderRow(newVal.sheetRange);
}, { immediate: true });

const emails = computed(() => {

  const allEmails = [...new Set(data.value.map((row) => row.email))];
  return allEmails;
  const header = selectedHeader.value;
  const operand = selectedOperand.value;

  if (isNaN(parseInt(quantity.value)) && operand !== "=") return [];

  return data.value.filter((row) => {
    switch (operand) {
      case "=":
        return row[header] === quantity;
      case ">":
        return row[header] > quantity;
      case "<":
        return row[header] < quantity;
      default:
        return false;
    }
  });
});

watch(selectedRange, async (newVal) => {

  loading.value = true;

  const rawData = await getEvery(newVal.sheetRange);
  data.value = await newVal.mappers.map(rawData);

  if (newVal.type === PanelType.MODULES || newVal.type === PanelType.COMPLETED_MODULES) {
    const students = await mapStudents(await getEvery(Range.STUDENTS));
    data.value.forEach((module) => {
      const student = students.find((student: Student) => student.id === module.studentId);
      if (student) module.email = student.email;
    });
  }

  data.value = data.value.filter((sheetItem) => sheetItem.email);

  console.log(data.value)

  loading.value = false;

}, { immediate: true });
</script>

<style scoped>
.email-box {
  height: 200px; 
  overflow-y: scroll; 
  border: 1px solid grey; 
  border-radius: 10px;
}
</style>