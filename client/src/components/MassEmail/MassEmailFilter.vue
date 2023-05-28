<template>
  <v-sheet
    elevation="7"
    class="d-flex flex-column align-center justify-center pt-2 px-2"
    style="width: 100%"
    rounded
  >
    <v-sheet
      class="d-flex flex-row"
      style="width: 100%"
    >
      <v-sheet
        style="width: 50%"
        class="px-2"
      >
        <h3>
          Target All:
        </h3>
        <v-select
          v-model="selectedRange"
          :items="Object.values(panels)"
          item-title="title.plural"
          return-object
          variant="outlined"
          class="mt-3"
        ></v-select>
      </v-sheet>
      <v-spacer></v-spacer>
      <v-sheet
        style="width: 50%"
        class="px-2"
      >
        <h3>
          Where:
        </h3>
        <v-select
          v-model="selectedHeader"
          :items="headerRow"
          variant="outlined"
          class="mt-3"
        ></v-select>
      </v-sheet>
    </v-sheet>
    <div>
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
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { SheetItem } from '../../SheetTypes'
import { getHeaderRow, getEvery, Range } from "../../SheetsAPI";
import { panels, getPanel } from "../../Panels";
import { Student, Graduate, Module, CompletedModule, Thesis } from "../../SheetTypes";
import { useDisplay } from "vuetify";
import {
  mapStudents,
  mapGraduates,
  mapModules,
  mapCompletedModules,
  mapTheses
} from "../../DataMappers";

const emits = defineEmits<{
  (e: 'subset', items: SheetItem[]): void,
  (e: 'loading', loading: boolean): void,
}>()

const { xs } = useDisplay();

const selectedRange = ref(null);
const selectedHeader = ref(null)
const headerRow = ref([])
const selectedOperand = ref("I")
const quantity = ref("")
const sheetItems = ref([])

watch(selectedHeader, () => {
  quantity.value = "";
});

watch(selectedRange, async (newVal) => {

  emits('loading', true);

  selectedHeader.value = null;
  selectedOperand.value = "I";
  quantity.value = "";

  headerRow.value = await getHeaderRow(newVal.sheetRange);
  // removes ability to query for custom student ranges
  if (newVal.sheetRange === Range.STUDENTS) {
    headerRow.value = headerRow.value.slice(0, 9);
  }

  const rawData = await getEvery(newVal.sheetRange);
  sheetItems.value = await newVal.mappers.map(rawData);

  if (newVal === getPanel('MODULES') || newVal === getPanel('COMPLETED_MODULES')) {
    const students = await mapStudents(await getEvery(Range.STUDENTS));
    sheetItems.value.forEach((module) => {
      const student = students.find((student: Student) => student.id === module.studentId);
      if (student) module.email = student.email;
    });
  }

  sheetItems.value = sheetItems.value.filter((sheetItem) => sheetItem.email);
  emits('loading', false);

});

const emails = computed(() => {

  if (!selectedHeader.value || !selectedOperand.value || quantity.value === "") {
    return [...new Set(sheetItems.value.map((row: any) => row.email))]
  };

  const header = selectedHeader.value;
  const operand = selectedOperand.value;

  const headerRowIndex = headerRow.value.indexOf(header);
  const dataArrayForm = sheetItems.value.map(row => {
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

  return [...new Set(output)]
});

watch(emails, (newVal) => {
  emits('subset', newVal);
}, { immediate: true });

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

</script>