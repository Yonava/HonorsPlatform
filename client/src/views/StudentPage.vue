<template>
  <v-sheet 
    :color="`${panel.color}-darken-2`"
    style="overscroll-y-behavior: none;"
  >
    <v-app-bar
      :color="`${panel.color}-darken-2`"
      class="px-5"
    >
      <div class="d-flex align-center">
        <v-icon 
          :icon="panel.icon" 
          size="x-large" 
          class="mr-2"
        ></v-icon>
        <v-menu>
          <template v-slot:activator="{ props }">
            <h1 
              v-bind="props"
              style="font-weight: 700; user-select: none; cursor: pointer;"
            >
              {{ panel.title }}
            </h1>
          </template>

          <v-list>
            <v-list-item
              v-for="type in PanelType"
              :key="type"
              @click="changePanel(type)"
              class="type-list-item"
            >
              <v-list-item-title
                :style="{
                  textTransform: 'capitalize',
                  color: type === panel.title.toLowerCase() ? panel.color : 'black',
                  fontWeight: type === panel.title.toLowerCase() ? 700 : 400,
                }"
              >{{ type }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
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
      <span 
        v-if="autoSync"
        class="d-flex align-center ml-5 px-2"
        style="background: red; border-radius: 5px; font-weight: 700;"
      >
        <div 
          class="fade-animate mr-2"
          style="background: white; width: 10px; height: 10px; border-radius: 50px;"
        ></div>
        LIVE
      </span>
      <v-btn 
        @click="showAddModal = true"
        class="ml-3"
        style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240);"
      >
        <v-icon 
          icon="mdi-plus" 
          size="large" 
          class="mr-2"
        ></v-icon>
        Add {{ panel.title.slice(0, -1) }}
      </v-btn>
      <v-btn 
        @click="fetchStudents"
        :loading="loadingStudents"
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
          :color="`${panel.color}-darken-2`"
          border 
          style="width: 5%; height: 100%; background: green"
        >
          <SortPanel 
            :students="students"
            @update="students = $event"
          />
          <v-spacer></v-spacer>
          <div 
            class="d-flex flex-column align-center"
            style="text-align: center;"
          >
            <div
              v-show="autoSync"
              class="mb-1"
              style="width: 25px; height: 25px; border-radius: 50px; background: #ff0500;"
            ></div>
            <span 
              style="width: 100%; line-height: 1.1em; font-weight: 400; font-size: 0.8em;"
            >Auto Sync</span>
            <v-switch
              v-model="autoSync"
              :color="`${panel.color}-lighten-4`"
              style="transform: translateY(-10px);"
              hide-details
            ></v-switch>
          </div>
        </v-sheet>
        <v-sheet 
          :color="`${panel.color}-lighten-4`"
          border 
          style="width: 25%; height: 100%; overflow: auto;"
          class="d-flex flex-column align-center"
        >  
          <StudentList
            @select="selectedStudent = $event"
            :students="displayStudents"
            :selected="selectedStudent"
            :loading="loadingStudents"
          />
        </v-sheet>
        <v-sheet 
          :color="`${panel.color}-lighten-5`"
          style="width: 70%; height: 100%;"
        >
          <div v-if="selectedStudent">
            <component
              :is="panel.detailComponent" 
              :student="selectedStudent"
              :autoSync="autoSync"
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
        class="honors-logo"
      >
    </v-main>
    <StudentAddModal 
      @close="showAddModal = false"
      @success="studentAdded($event)"
      :show="showAddModal"
      :studentAttrs="studentAttrs"
    />
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue' 
import { getStudents, deleteStudent, updateStudent } from '../SheetsAPI'
import StudentAddModal from '../components/StudentAddModal.vue'
import StudentList from '../components/StudentList.vue'
import StudentDetail from '../components/StudentDetail.vue'
import SortPanel from '../components/SortPanel.vue'
import { useKeyBindings } from '../KeyBindings'
import { PanelType, Panel, switchPanel } from '../SwitchPanel'

const students = ref([])
const studentAttrs = ref([])
const loadingStudents = ref(false)
const showAddModal = ref(false)
const filterQuery = ref('')
const autoSync = ref(false)
const selectedStudent = ref(undefined)

const panel = ref<Panel>(switchPanel(PanelType.GRADUATES))

const changePanel = (panelType: PanelType) => {
  panel.value = switchPanel(panelType)
}

useKeyBindings({
  'a': () => autoSync.value = !autoSync.value,
  's': () => showAddModal.value = !showAddModal.value,
  'r': () => fetchStudents(),
  '/': () => document.querySelector('input').focus(),
})

onMounted(async () => {
  await fetchStudents()
})

async function reqDeleteStudent() {
  await deleteStudent(selectedStudent.value.rowNum);
  selectedStudent.value = undefined
  loadingStudents.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  await fetchStudents()
}

async function studentAdded(studentId: string) {
  showAddModal.value = false
  await fetchStudents()
  selectedStudent.value = students.value.find((student: any) => student.id === studentId)
  const index = students.value.indexOf(selectedStudent.value)
  if (index === -1) return
  students.value.splice(index, 1)
  students.value.unshift(selectedStudent.value)
}

async function fetchStudents() {
  selectedStudent.value = undefined;
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
</script>

<style scoped>
.type-list-item {
  cursor: pointer;
  transition: 0.2s ease;
}

.type-list-item:hover {
  background: rgba(0, 0, 0, 0.1);
}

.search-input {
  background: rgba(0, 0, 0, 0.3); 
  color: rgb(240, 240, 240); 
  border-radius: 50px; 
  padding: 3px; 
  padding-left: 15px;
  border: none; 
  width: 400px; 
  font-size: 1.4em; 
  font-weight: 200; 
  box-shadow: 2px 1px 4px rgba(0, 0, 0, 0.5);
  margin-left: 25px;
  transition: 0.3s ease;
}

.search-input:focus {
  width: 600px;
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

.fade-animate {
  animation: fade-in-out 1.5s ease-in-out infinite alternate;
}

img.honors-logo {
  position: absolute; 
  bottom: 0; 
  right: 0; 
  mix-blend-mode: multiply; 
  margin: 20px;
}

@keyframes fade-in-out {
  0% {
    opacity: 0;
  }
  75% {
    opacity: 0.95;
  }
  100% {
    opacity: 1;
  }
}
</style>