<template>
  <div>
    <v-app-bar
      color="blue-darken-2"
      class="px-5"
    >
      <div
        @click="showAddModal = true"
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
          class="d-flex align-center flex-column flex-start pt-3"
          color="blue-darken-2" 
          border 
          style="width: 5%; height: 100%; background: green"
        >
          <!-- <v-icon 
            icon="mdi-sort"  
          ></v-icon> -->
          <b style="font-size: 0.9rem; text-decoration: underline">
            Sort By:
          </b>
          <div
            v-for="sort in sortOptions"
            :key="sort"
            class="d-flex justify-center align-center flex-column mt-2"
            style="width: 100%; height: 50px; cursor: pointer; text-align: center;"
          >
            <v-icon>{{ sort.icon }}</v-icon>
            <p style="font-size: 0.9rem; line-height: 1.1;">{{ sort.label }}</p>
          </div>
        </v-sheet>
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
              @update="reqUpdateStudent"
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
import { ref, onMounted } from 'vue' 
import { getStudents, deleteStudent, updateStudent } from '../SheetsAPI'
import StudentAddModal from '../components/StudentAddModal.vue'
import StudentList from '../components/StudentList.vue'
import StudentDetail from '../components/StudentDetail.vue'

const students = ref([])
const studentAttrs = ref([])
const loadingStudents = ref(false)
const updatingStudent = ref(false)
const showAddModal = ref(false)

const sortOptions = ref([
  { label: 'Name', icon: 'mdi-sort-alphabetical-ascending' },
  { label: 'Points', icon: 'mdi-sort-numeric-ascending' },
  { label: 'Active Status', icon: 'mdi-sort-variant' },
])

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
  console.log('fetching students')
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

async function reqUpdateStudent() {
  updatingStudent.value = true
  await updateStudent(selected.value)
  updatingStudent.value = false
}
</script>