<template>
  <div>
    <v-sheet class="d-flex align-center justify-center flex-column">
      <h1>
        Honors Leaderboard:
      </h1>

      <div 
        v-if="!error && !loading"
        class="d-flex flex-column"
      >
        <div 
          v-for="student in students"
          :key="student.name"
        >
          {{ student.name }}: {{ student.points }}
        </div>
      </div>
      <div v-else-if="error">
        Our apologies, we are unable to retrieve the leaderboard at this time.
      </div>
      <div v-else>
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </div>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import { getNonSensitiveData } from "../SheetsAPI";
import { ref } from "vue";

const students = ref([]);
const error = ref(false);
const loading = ref(true);

async function getStudents() {
  let data;
  try {
    data = await getNonSensitiveData('points');
  } catch {
    error.value = true;
  }
  students.value = data;
  students.value.sort((a, b) => b.points - a.points);
  loading.value = false;
}

getStudents();
</script>
