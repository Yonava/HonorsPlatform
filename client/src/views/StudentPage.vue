<template>
  <div>
    <v-app-bar
      color="blue-darken-2"
      class="px-5"
    >
      <div
        @click="fetchStudents"
        class="d-flex align-center"
        style="cursor: pointer;"
      >
        <v-icon 
          icon="mdi-account-group" 
          size="x-large" 
          class="mr-2"
        ></v-icon>
        <h1 style="font-weight: 700;">
          Students
        </h1>
        <p class="ml-2">
          ({{ students.length }})
        </p>
      </div>
    </v-app-bar>
    <v-main>
      <div 
        style="position: relative; height: calc(100vh - 64px);" 
        class="d-flex flex-row"
      >
        <v-sheet 
          color="blue-darken-2" 
          border 
          style="width: 5%; height: 100%; background: green"
        ></v-sheet>
        <v-sheet 
          color="blue-lighten-4" 
          border 
          style="width: 25%; height: 100%; overflow: auto;"
          class="d-flex flex-column align-center"
        >  
          <StudentList
            :students="students"
            :loading="loadingStudents"
            @select="selected = $event"
          />
        </v-sheet>
        <v-sheet 
          color="blue-lighten-5" 
          style="width: 70%; height: 100%;"
        >
          <div v-if="selected">
            <StudentDetail 
              :student="selected"
              @delete="reqDeleteStudent(selected.rowNum)"
            />
          </div>
          <div 
            v-else
            class="d-flex flex-column align-center justify-center mt-10"
          >
            <span style="font-weight: 200; font-size: 2em;">
              select a student to view their profile
            </span>
          </div>
        </v-sheet>
      </div>
      <img 
        src="../assets/honorsLogo.png"
        style="position: absolute; bottom: 0; right: 0; mix-blend-mode: multiply; margin: 20px;" 
      >
    </v-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue' 
import { getStudents, deleteStudent } from '../SheetsAPI'
import StudentList from '../components/StudentList.vue'
import StudentDetail from '../components/StudentDetail.vue'

const students = ref([])
const loadingStudents = ref(false)

const selected = ref(undefined)

onMounted(async () => {
  await fetchStudents()
})

async function reqDeleteStudent(rowNum: number) {
  await deleteStudent(rowNum);
  loadingStudents.value = true;
  await new Promise(resolve => setTimeout(resolve, 1000));
  await fetchStudents();
}

async function fetchStudents() {
  loadingStudents.value = true
  students.value = []
  const data = await getStudents()

  data.slice(1).forEach((row: any, index: number) => {
    if (row.length === 0) return
    const misc = data[0].slice(6).reduce((acc: any, category: string, index: number) => {
      if (category === '') return acc
      acc[category] = row[index + 6] ?? ''
      return acc
    }, {})
    students.value.push({
      // + 1 for header row, + 1 for 0-indexing
      rowNum: index + 2,
      name: row[0],
      id: row[1],
      email: row[2],
      points: row[3],
      activeStatus: row[4],
      note: row[5],
      misc
    })
  })
  loadingStudents.value = false
}
</script>