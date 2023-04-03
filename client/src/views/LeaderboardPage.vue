<template>
  <div class="outer-matte">
    <v-sheet 
      class="d-flex align-center justify-center flex-column"
      style="width: 90%; height: 90%; overflow: hidden;"
      elevation="10"
      color="grey-lighten-4"
    >
      <h1 style="font-size: 4rem; font-weight: 700; position: absolute; top: 10%;">
        Honors Leaderboard
      </h1>
      <div 
        v-if="!error && !loading"
        class="d-flex flex-column align-center mt-10"
      >
        <div class="d-flex flex-row justify-space-between mb-3">
          <v-sheet
            v-for="(rank, index) in ['yellow-darken-1', 'grey-darken-1', 'brown-darken-2']"
            :key="rank"
            :color="rank"
            class="mx-3 pa-2"
            style="border-radius: 10px; border: 1px solid black;"
            elevation="4"
          > 
            <h4>#{{ index + 1 }} with {{ students[index].points.toLocaleString() }} points</h4>
            <h2>{{ students[index].name }}</h2>
          </v-sheet>
        </div>
        <div style="border-bottom: 1px solid black; width: 100%;"></div>
        <div 
          class="d-flex flex-column align-center justify-space-between"
          style="height: 50vh; width: 100%; overflow: auto"
        >
          <div 
            v-for="student in students.slice(3)"
            :key="student.name"
            style="width: 60%;"
          >
            <div 
              class="d-flex flex-row align-center justify-space-between"
              style="width: 100%;"
            >
              <div 
                style="width: 25%;"
                class="d-flex flex-row justify-start"
              >
                <div>{{ student.rank }}.</div>
              </div>
              <div 
                style="width: 50%"
                class="d-flex flex-row justify-center"
              >
                <div>{{ student.name }}</div>
              </div>
              <div 
                style="width: 25%"
                class="d-flex flex-row justify-end"
              >
                <div>{{ student.points.toLocaleString() }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="error">
        Our apologies, we are unable to retrieve the leaderboard at this time.
      </div>
      <div 
        v-else-if="loading"
        style="position: absolute; top: 24%;"
      >
        <v-progress-circular
          indeterminate
          size="64" 
        ></v-progress-circular>
      </div>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import { getNonSensitiveData } from "../SheetsAPI";
import { ref } from "vue";

const students = ref<LeaderboardItem[]>([]);
const error = ref(false);
const loading = ref(true);

type LeaderboardItem = {
  name: string;
  points: number;
  rank: number;
}

async function getStudents() {
  try {
    const data: LeaderboardItem[] = await getNonSensitiveData('points');
    students.value = data
      .sort((a, b) => b.points - a.points)
      .map((student, index) => ({
        name: student.name,
        points: student.points,
        rank: index + 1,
      }))
  } catch {
    error.value = true;
  }
  loading.value = false;
}

getStudents();
</script>

<style scoped>
.outer-matte {
  background-color: #EBB02D;
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
