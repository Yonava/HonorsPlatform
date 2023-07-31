<template>
  <div class="outer-matte">
    <v-btn
      @click="$router.push('/panel')"
      variant="text"
      class="mt-3 ml-3"
      style="position: absolute; left: 0; top: 0"
    >
      <v-icon>
        mdi-arrow-left
      </v-icon>
      Admin Dashboard
    </v-btn>
    <v-sheet
      class="d-flex align-center justify-center flex-column"
      style="width: 90%; height: 90%; overflow: hidden;"
      elevation="10"
      color="grey-lighten-4"
    >
      <h1 style="font-size: 7.5vw; font-weight: 700; position: absolute; top: 10%;">
        Honors Leaderboard
      </h1>
      <div
        v-if="smAndUp"
        style="margin: 100px"
      ></div>
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
            <h4
              :style="{
                fontSize: xs.value ? '4vw' : '2vw',
                fontWeight: 700,
              }"
            >
              #{{ index + 1 }} with {{ students[index].points.toLocaleString() }} points
            </h4>
            <h2
              :style="{
                fontSize: xs.value ? '6vw' : '3vw',
                fontWeight: 700,
              }"
            >
              {{ students[index].name }}
            </h2>
          </v-sheet>
        </div>
        <div
          class="d-flex flex-column align-center"
          style="height: 50vh; width: 100%; overflow: auto"
        >
          <div
            v-for="student in students.slice(3)"
            :key="student.name"
            style="width: 60%; min-width: 300px; border-bottom:"
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
          <div
            style="margin-top: 500px;"
          ></div>
        </div>
      </div>
      <div v-else-if="error">
        Our apologies, we are unable to retrieve the leaderboard at this time.
      </div>
      <div
        v-else-if="loading"
        style="position: absolute; top: 30%;"
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
import { ref } from "vue";
import { useDisplay } from 'vuetify'

const { xs, smAndUp } = useDisplay()
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
    const data: LeaderboardItem[] = [];
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
  position: relative;
}
</style>
