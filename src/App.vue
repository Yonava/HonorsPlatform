<template>
  <v-app>
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
        <h1 @click="fetchGoogleSheetsData" style="font-weight: 700;">
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
          <div
            style="position: relative; width: 100%"
            class="d-flex flex-column align-center mt-2"
          >
            <div
              v-for="student in students"
              :key="student"
              @click="selected = student"
              :class="[
                'mb-2',
                'student-card',
                selected === student ? 'selected-student-card' : ''
              ]"
            >
              <div style="font-weight: 900; font-size: 1.25em;">
                {{ student.name }}
              </div>
              <div style="font-size: 0.9em;">
                {{ student.id }} - {{ student.email }} - {{ student.activeStatus }}
              </div>
            </div>
          </div>
        </v-sheet>
        <v-sheet 
          color="blue-lighten-5" 
          style="width: 70%; height: 100%;"
        >
          <div 
            class="d-flex flex-row"
            style="padding: 20px" 
          >
            <div style="width: 55%;">
              <p style="font-weight: 200">
                {{ selected.id }}
                {{ selected }}
              </p>
              <div class="d-flex flex-row align-center">
                <h1 style="font-weight: 900; font-size: 3em; line-height: 0.9">
                  {{ selected.name }}
                </h1>
                <v-icon 
                  class="ml-4"
                  size="large"
                  style="cursor: pointer;"
                  @click="editing = !editing"
                >
                  mdi-pencil
                </v-icon>
              </div>
              <v-divider class="my-2"></v-divider>
              <v-text-field
                label="Email"
                outlined
                v-model="selected.email"
              >
                <template #prepend>
                  <v-icon>mdi-email</v-icon>
                </template>
              </v-text-field>
              <v-text-field
                label="Points"
                outlined
                v-model="selected.points"
              >
                <template #prepend>
                  <v-icon>mdi-ticket</v-icon>
                </template>
              </v-text-field>
              <v-text-field
                label="Active Status"
                outlined
                v-model="selected.activeStatus"
              >
                <template #prepend>
                  <v-icon>mdi-card-account-details</v-icon>
                </template>
              </v-text-field>
              <v-divider class="my-2"></v-divider>
              <div>
                <h2>
                  Modules In Progress:
                </h2>
                <div style="overflow: auto; height: 200px;">
                  <div 
                    v-for="i in ['CS231', 'MAT530', 'HIS777']"
                    :key="i"
                    class="module-card mb-1 d-flex flex-row align-center"
                  >
                    <h4 style="color: rgba(255,255,255,0.9); font-size: 1.25em">
                      {{ i }}
                    </h4>
                    <span 
                      class="ml-2" 
                      style="color: white; line-height: 1.1; font-weight: 300;"
                    >this is a short description of the module</span>
                    <v-icon 
                      color="white"
                      style="cursor: pointer; margin-left: auto;"
                    >
                      mdi-close
                    </v-icon>
                  </div>
                </div>
              </div>
            </div>
            <div 
              style="width: 45%;" 
              class="ml-5 d-flex flex-column"
            >
              <v-textarea
                v-model="selected.note"
                clearable
                :label="`leave a note on ${selected.name}`"
                no-resize
              ></v-textarea>
            </div>
          </div>
        </v-sheet>
      </div>
      <img 
        src="./assets/honorsLogo.png"
        style="position: absolute; bottom: 0; right: 0; mix-blend-mode: multiply; margin: 20px;" 
      >
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const students = ref([
  {
    id: '329420',
    name: 'John Doe',
    email: 'john@snhu.edu',
    points: 100,
    activeStatus: 'active',
    note: ''
  },
  {
    id: '2039203',
    name: 'Jane Doe',
    email: 'jane@snhu.edu',
    points: 100,
    activeStatus: 'active',
    note: ''
  },
  {
    id: '334423',
    name: 'John Smith',
    email: 'john@snhu.edu',
    points: 100,
    activeStatus: 'inactive',
    note: ''
  }
])

const selected = ref(students.value[0])
const editing = ref(false)

async function fetchGoogleSheetsData() {
  const key = 'AIzaSyDJtifzdi9ZJI1zsyZYCeTHXEXJlgHnLl8'
  const range = 'Students'
  const spreadsheetId = '1bW-aQRn-GAbTsNkV2VB9xtBFT3n-LPrSJXua_NA2G6Y'
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}/?key=${key}`)
  const data = await res.json()
  console.log(data)

  students.value = data.values.slice(1).map((row: any) => {
    return {
      name: row[0],
      id: row[1],
      email: row[2],
      points: row[3],
      activeStatus: row[4],
      note: row[5]
    }
  })

  data.values[0].slice(6).forEach((category: string) => {
    if (category === '') return
    const idx = data.values[0].indexOf(category)
    data.values.slice(1).forEach((studentData: any, index: number) => {
      // @ts-ignore
      students.value[index][category] = studentData[idx]
    })
  })
}
</script>

<style scoped>
.student-card {
  width: 92%;
  background: rgba(255,255,255, 0.5);
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
  transition: 350ms;
}

.selected-student-card {
  background: rgba(255,255,255, 0.7);
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
  border: 1px solid rgba(0,0,0);
}

.student-card:hover {
  background: rgba(255,255,255, 0.7);
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
  transform: scale(0.98)
}

.module-card {
  background: #467ada;
  border-radius: 10px;
  padding: 10px;
  transition: 300ms;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
}

.module-card:hover {
  background: #143875;
}
</style>