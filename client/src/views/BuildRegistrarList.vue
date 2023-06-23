<template>
  <v-sheet
    color="blue-darken-3"
    style="height: 100%; width: 100%;"
    class="d-flex flex-column align-center justify-center"
  >
    <v-sheet
      class="pa-5"
      style="border-radius: 20px;"
      elevation="7"
    >
      <h1 class="mb-4">
        Create Registrar List
      </h1>
      <v-btn
        v-if="!term"
        @click="term = getCurrentTerm()"
        color="blue-darken-2"
        size="x-small"
        class="mb-3"
      >Current Term</v-btn>
      <v-text-field
        v-model="term"
        @keyup.enter="generateRegistrarList"
        :rules="[(v) => termValidator(v) || 'Potentially invalid term']"
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
        v-if="hasSucceeded"
        size="small"
        href="https://docs.google.com/spreadsheets/d/1bW-aQRn-GAbTsNkV2VB9xtBFT3n-LPrSJXua_NA2G6Y/edit#gid=810473563"
        target="_blank"
        class="mt-4"
        color="blue-darken-2"
      >
        view new registrar list
      </v-btn>
      <div class="mt-5 d-flex flex-column justify-center align-center">
        <v-btn
          @click="goBack"
          color="red"
          size="small"
          variant="text"
        >Return To Panel</v-btn>
      </div>
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
import { getEvery, replaceRange } from "../SheetsAPI";
import { ref, computed, watch } from "vue";
import { termValidator, getCurrentTerm } from "../TermValidator";

const sheet = ref(null);
const loading = ref(false);
const term = ref("");
const success = ref(false);

// if the user has successfully generated at least one registrar list
const hasSucceeded = ref(false);

async function generateRegistrarList() {
  loading.value = true;
  const students = await getEvery('Students');
  const completedModules = await getEvery('Completed Modules')
  const termColumn = 4;
  const modulesInTerm = completedModules.filter((module) => {
    if (!module[termColumn]) return false
    return module[termColumn].toLowerCase() === term.value.toLowerCase();
  });
  const output = modulesInTerm.map(module => {
    let student = students.find(student => student[1] === module[1]);
    student ??= ["", "", ""];
    return [
      student[1],
      student[2],
      student[3],
      module[2],
    ]
  })
  output.unshift([
    "Student ID",
    "Name",
    "Email",
    "Course Code",
    `Generated on ${new Date().toLocaleString('en-US')} for ${term.value.toUpperCase()}`
  ]);
  await replaceRange('Registrar List', output);
  loading.value = false;
  success.value = true;
  hasSucceeded.value = true;
}

function goBack() {
  history.back();
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

watch(success, (val) => {
  if (val) {
    const successTimeout = setTimeout(() => {
      success.value = false;
      clearTimeout(successTimeout);
    }, 6000);
  }
});

watch(term, () => {
  success.value = false;
});
</script>