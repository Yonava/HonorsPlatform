<template>
  <v-sheet class="pa-5">

    <v-text-field
      v-model="userEnteredTerm"
      @keyup.enter="generateRegistrarList"
      :rules="[(v) => termValidator(v) || 'Potentially invalid term']"
      ref="termInput"
      variant="outlined"
      label="Term"
    ></v-text-field>

    <v-btn
      @click="generateRegistrarList"
      :loading="loading"
      :disabled="!userEnteredTerm"
      :color="button.color"
      size="x-large"
      block
    >
      {{ button.text }}
    </v-btn>

    <v-btn
      v-if="listWasGenerated"
      size="small"
      href="https://docs.google.com/spreadsheets/d/1bW-aQRn-GAbTsNkV2VB9xtBFT3n-LPrSJXua_NA2G6Y/edit#gid=810473563"
      target="_blank"
      class="mt-4"
      color="blue-darken-2"
    >
      view new registrar list
    </v-btn>

  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useDocumentCache } from "@store/useDocumentCache";
import { useAutoFocus } from "@composables/useInputFocus";
import { replaceRange } from "../../SheetsAPI";
import { termValidator, getCurrentTerm } from "../../TermValidator";

const loading = ref(false);
const success = ref(false);
const userEnteredTerm = ref(getCurrentTerm());

const termInput = ref(null);
useAutoFocus(termInput);

const listWasGenerated = ref(false);

const generateRegistrarList = async () => {
  loading.value = true;

  const { "Completed Modules": CompletedModules, getItemBySysId } = useDocumentCache();

  const modulesInTerm = CompletedModules.list.filter((module) => {
    if (!module.term) return false
    return module.term.toLowerCase() === userEnteredTerm.value.toLowerCase();
  })

  const registrarListRows = modulesInTerm.map((module) => {
    const id = module.studentSysId
    const student = getItemBySysId(id, 'STUDENTS') ?? getItemBySysId(id, 'GRADUATES')
    if (!student) return null
    return [
      student.id,
      student.name,
      student.email,
      module.courseCode
    ]
  }).filter((row) => row !== null) as string[][]

  registrarListRows.unshift([
    "Student ID",
    "Name",
    "Email",
    "Course Code",
    `Generated on ${new Date().toLocaleString('en-US')} for ${userEnteredTerm.value.toUpperCase()}`
  ]);

  await replaceRange('Registrar List', registrarListRows);

  loading.value = false;
  success.value = true;
  listWasGenerated.value = true;
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

watch(userEnteredTerm, () => {
  success.value = false;
});
</script>