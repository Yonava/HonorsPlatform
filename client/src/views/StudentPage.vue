<template>
  <div>
    <v-app-bar
      color="blue-darken-2"
      class="px-5"
    >
      <div class="d-flex align-center">
        <v-icon 
          icon="mdi-account-group" 
          size="x-large" 
          class="mr-2"
        ></v-icon>
        <h1 style="font-weight: 700;">
          Students
        </h1>
        <p 
          :style="{
            opacity: loadingStudents ? 0 : 1,
          }"
          class="ml-2"
        >
          ({{ displayStudents.length }})
        </p>
      </div>
      <input
        v-model="filterQuery"
        placeholder="filter by name, id, email or note"
        class="search-input"
        type="text"
      >
      <v-spacer></v-spacer>
      <v-btn 
        @click="showAddModal = true"
        class="ml-5"
        style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240);"
      >
        <v-icon 
          icon="mdi-plus" 
          size="large" 
          class="mr-2"
        ></v-icon>
        Add Student
      </v-btn>
      <v-btn 
        @click="refreshBtn"
        class="ml-3"
        style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240);"
      >
        <v-icon 
          icon="mdi-refresh" 
          size="large" 
          class="mr-2"
        ></v-icon>
        Refresh Data
      </v-btn>
    </v-app-bar>
    <v-main>
      <div 
        style="position: relative; height: calc(100vh - 64px);" 
        class="d-flex flex-row"
      >
        <v-sheet 
          class="d-flex align-center flex-column flex-start pt-3"
          color="blue-darken-2" 
          border 
          style="width: 5%; height: 100%; background: green"
        >
          <SortPanel 
            :students="students"
            @update="students = $event"
          />
        </v-sheet>
        <v-sheet 
          color="blue-lighten-4" 
          border 
          style="width: 25%; height: 100%; overflow: auto;"
          class="d-flex flex-column align-center"
        >  
          <StudentList
            :students="displayStudents"
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
              @delete="reqDeleteStudent"
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
    <StudentAddModal 
      :show="showAddModal"
      :studentAttrs="studentAttrs"
      @close="showAddModal = false"
      @reFetchStudents="fetchStudents"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue' 
import { getStudents, deleteStudent, updateStudent } from '../SheetsAPI'
import StudentAddModal from '../components/StudentAddModal.vue'
import StudentList from '../components/StudentList.vue'
import StudentDetail from '../components/StudentDetail.vue'
import SortPanel from '../components/SortPanel.vue'

const students = ref([])
const studentAttrs = ref([])
const loadingStudents = ref(false)
const showAddModal = ref(false)
const filterQuery = ref('')

const selected = ref(undefined)

onMounted(async () => {
  await fetchStudents()
})

async function reqDeleteStudent() {
  await deleteStudent(selected.value.rowNum);
  selected.value = undefined
  loadingStudents.value = true;
  await new Promise(resolve => setTimeout(resolve, 1000));
  await fetchStudents();
}

async function fetchStudents() {
  loadingStudents.value = true
  students.value = []
  const data = await getStudents()
  studentAttrs.value = data[0]

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
      name: row[0] ?? '',
      id: row[1] ?? '',
      email: row[2] ?? '',
      points: row[3] ?? 0,
      activeStatus: row[4] ?? '',
      note: row[5] ?? '',
      misc
    })
  })
  loadingStudents.value = false
}

const displayStudents = computed(() => {
  if (filterQuery.value === '') return students.value
  return students.value.filter((student: any) => {
    const query = filterQuery.value.toLowerCase();
    const values = Object.values(student).join(' ').toLowerCase();
    return values.includes(query)
  })
})

async function refreshBtn() {
  selected.value = undefined;
  await fetchStudents();
}
</script>

<style scoped>
.search-input {
  background: rgba(0, 0, 0, 0.3); 
  color: rgb(240, 240, 240); 
  border-radius: 50px; 
  padding: 3px; 
  padding-left: 15px;
  border: none; 
  width: 500px; 
  font-size: 1.4em; 
  font-weight: 200; 
  box-shadow: 2px 1px 4px rgba(0, 0, 0, 0.5);
  margin-left: 25px;
  transition: 0.3s ease;
}

.search-input:focus {
  width: 750px;
  box-shadow: 3px 2px 9px rgba(0, 0, 0, 0.5);
  outline: none;
}

.search-input:focus::placeholder {
  color: transparent;
}

.search-input:hover {
  box-shadow: 3px 2px 9px rgba(0, 0, 0, 0.5);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.569);
}
</style>