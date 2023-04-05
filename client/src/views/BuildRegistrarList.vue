<template>
  <v-sheet
    color="blue-lighten-1"
    style="height: 100%; width: 100%;"
    class="d-flex flex-column align-center justify-center"
  >
    <v-sheet 
      class="pa-5"
      style="border-radius: 20px;"
      elevation="7"
    >
      <h1>
        Create Registrar List
      </h1>
      <v-text-field
        v-model="term"
        class="mt-6"
        variant="outlined"
        label="Term"
      ></v-text-field>
      <v-btn
        @click="generateRegistrarList"
        :loading="loading"
        :disabled="!term"
        :color="button.color"
        size="x-large"
        block
      >{{ button.text }}</v-btn>
      <v-btn
        v-if="success"
        size="small"
        href="https://docs.google.com/spreadsheets/d/1bW-aQRn-GAbTsNkV2VB9xtBFT3n-LPrSJXua_NA2G6Y/edit#gid=810473563"
        target="_blank"
        class="mt-4"
        color="blue-darken-2"
      >
        view new registrar list
      </v-btn>
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
import { Range, getEvery, replaceRange } from "../SheetsAPI";
import { ref, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const sheet = ref(null);
const loading = ref(false);
const term = ref("");
const success = ref(false);

async function generateRegistrarList() {
  loading.value = true;
  const modules = await getEvery(Range.MODULES);
  const students = await getEvery(Range.STUDENTS);
  const termColumn = 3;
  const modulesInTerm = modules.filter((module) => {
    return module[termColumn].toLowerCase() === term.value.toLowerCase();
  });
  const output = modulesInTerm.map(module => {
    let student = students.find(student => student[0] === module[0]);
    student ??= ["Data Not Available", "Data Not Available", "Data Not Available"];
    return [
      student[0],
      student[1],
      student[2],
      module[1],
    ]
  })
  output.unshift([
    "Student ID", 
    "Name", 
    "Email", 
    "Course Code",
    `Generated on ${new Date().toLocaleString()}`
  ]);
  await replaceRange(Range.REGISTRAR_LIST, output);
  loading.value = false;
  success.value = true;
}

const button = computed(() => {
  if (success.value) {
    return {
      text: "Success!",
      color: "green",
    };
  }
  return {
    text: "Generate",
    color: "blue-darken-2",
  };
});
</script>