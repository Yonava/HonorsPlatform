<template> 
  <v-sheet 
    color="blue-darken-2"
    style="height: 100vh; width: 100vw;"
    class="d-flex flex-column align-center justify-center"
  >
    <v-sheet 
      class="d-flex flex-column align-center justify-center"
      elevation="7"
      :style="{
        width: smAndDown ? '100vw' : '500px',
        height: smAndDown ? '100vh' : '',
        borderRadius: smAndDown ? '0px' : '10px',
        overflowY: 'scroll',
        position: 'relative',
      }"
    >
      <v-btn 
        @click="back"
        variant="text"
        style="position: absolute; left: 0; top: 0"
      >
        <v-icon class="mr-1">mdi-arrow-left</v-icon>
        Back to Dashboard
      </v-btn>
      <h1 
        v-if="!xs"
        class="mt-10 mb-4"
      >
        <v-icon>
          mdi-email-fast-outline
        </v-icon>
        Compose Mass Email
      </h1>
      <div class="d-flex flex-column align-center justify-center">
        <div 
          class="d-flex flex-row"
          style="width: 100%"
        >
          <v-sheet
            style="width: 48%"
            class="px-2"
          >
            <h3>
              Target All:
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
          </v-sheet>
          <v-spacer></v-spacer>
          <v-sheet 
            style="width: 48%"
            class="px-2"
          >
            <h3>
              Where:
            </h3>
            <v-select
              v-model="selectedHeader"
              :items="headerRow"
              :prepend-icon="selectedHeader ? 'mdi-check' : 'mdi-alert-circle-outline'"
              label="Criteria"
              variant="outlined"
              class="mt-3"
            ></v-select>
          </v-sheet>
        </div>
        <div class="d-flex flex-row flex-wrap align-center justify-center">
          <v-btn
            v-for="operand in operandButtons"
            :key="operand"
            @click="selectedOperand = operand.value"
            :color="selectedOperand === operand.value ? 'blue-darken-2' : 'grey'"
            size="small"
            class="mx-1"
            rounded
          >
            {{ xs ? operand.shortText : operand.text }}
          </v-btn>
        </div>
        <v-text-field
          v-model="quantity"
          :prepend-icon="quantity ? 'mdi-check' : 'mdi-alert-circle-outline'"
          label="Content"
          variant="outlined"
          class="mt-6"
          style="width: 96%"
        ></v-text-field>
        <v-icon 
          v-if="xs"
          class="mb-6"
          size="x-large"
        >mdi-arrow-down</v-icon>
        <div style="position: relative">
          <v-progress-linear
            v-if="loading"
            indeterminate
            absolute
            color="blue-darken-2"
          ></v-progress-linear>
          <div
            :style="{
              opacity: loading ? 0.25 : 1,
              width: smAndDown ? 'calc(100vw - 30px)' : '450px',
            }"
            class="px-1 email-box"
          >
            <v-chip
              v-for="email in emails"
              :key="email"
              color="blue-darken-4"
              class="my-1 mr-1 text-center"
            >
              {{ email }}
              <v-icon
                @click="tempEmailFilter.push(email)"
                class="ml-1"
                style="cursor: pointer;"
              >mdi-close</v-icon>
            </v-chip>
            <div v-if="emails.length === 0 && !loading">
              <h3 
                style="opacity: 0.5;"
                class="text-center mt-5"
              >
                <v-icon>mdi-email</v-icon>
                No Emails Found
              </h3>
            </div>
          </div>
          <v-btn
            @click="sendEmail"
            :disabled="emails.length === 0"
            block
            color="blue-darken-2"
            size="large"
            class="my-3"
          >
            Send Email ({{ emails.length }} 
            recipient{{ emails.length === 1 ? '' : 's' }})
          </v-btn>
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
import { useDisplay } from "vuetify";
import { 
  mapStudents,
  mapGraduates,
  mapModules,
  mapCompletedModules,
  mapTheses
} from "../DataMappers";

const operandButtons = [
  { 
    text: "Includes", 
    shortText: "Includes",
    value: "I" 
  },
  { 
    text: "Equals", 
    shortText: "=",
    value: "=" 
  },
  { 
    text: "Greater Than", 
    shortText: ">",
    value: ">" 
  },
  { 
    text: "Less Than", 
    shortText: "<",
    value: "<" 
  },
];

const panels = Object.values(PanelType).map((panel) => switchPanel(panel));
const { smAndDown, xs } = useDisplay();
const selectedRange = ref(panels[0]);
const headerRow = ref([]);
const selectedHeader = ref(null);
const selectedOperand = ref("I");
const quantity = ref("");
const data = ref([])
const loading = ref(false);
const tempEmailFilter = ref([]);

watch(selectedRange, async (newVal) => {
  selectedHeader.value = null;
  selectedOperand.value = "I";
  quantity.value = "";
  tempEmailFilter.value = [];
  headerRow.value = await getHeaderRow(newVal.sheetRange);
  // removes ability to query for custom student ranges
  if (newVal.sheetRange === Range.STUDENTS) {
    headerRow.value = headerRow.value.slice(0, 7);
  }
}, { immediate: true });

const emails = computed(() => {

  if (!selectedHeader.value || !selectedOperand.value || quantity.value === "") {
    return [...new Set(data.value.map((row: any) => row.email))].filter((email) => {
      return tempEmailFilter.value.indexOf(email) === -1;
    });
  };

  const header = selectedHeader.value;
  const operand = selectedOperand.value;

  const headerRowIndex = headerRow.value.indexOf(header);
  const dataArrayForm = data.value.map(row => {
    const array = Object.values(row)
    // remove the row number
    array.shift()
    return array
  });

  const filteredData = dataArrayForm.filter((row: string[]) => {
    switch (operand) {
      case "I":
        const str = row[headerRowIndex].toString().toLowerCase();
        return str.includes(quantity.value.toLowerCase());
      case "=":
        return row[headerRowIndex] == quantity.value;
      case ">":
        return row[headerRowIndex] > quantity.value;
      case "<":
        return row[headerRowIndex] < quantity.value;
      default:
        return false;
    }
  });

  const output = [];

  // if any of the data in filteredData matches email regex, return it in an array
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  for (let i = 0; i < filteredData.length; i++) {
    for (let j = 0; j < filteredData[i].length; j++) {
      if (emailRegex.test(filteredData[i][j] as string)) {
        output.push(filteredData[i][j]);
      }
    }
  }

  return [...new Set(output)].filter((email) => {
    return tempEmailFilter.value.indexOf(email) === -1;
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

  loading.value = false;

}, { immediate: true });

watch(selectedHeader, () => {
  quantity.value = "";
});

const sendEmail = () => {
  const emailString = emails.value.join(",");
  window.open(`mailto:${emailString}`);
};

const back = () => history.back();
</script>

<style scoped>
.email-box {
  height: 200px; 
  overflow-y: scroll; 
  border: 1px solid grey; 
  background: rgb(248, 248, 248);
  border-radius: 5px;
}
</style>