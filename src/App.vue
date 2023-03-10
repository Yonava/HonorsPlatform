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
        <h1 style="font-weight: 700;">
          Students
        </h1>
        <p class="ml-2">
          ({{ students.length }})
        </p>
      </div>
    </v-app-bar>
    <v-main>

    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'

const students = ref([
  {
    id: 1,
    name: 'John Doe',
    email: 'john@snhu.edu',
  },
  {
    id: 2,
    name: 'Jane Doe',
    email: 'jane'
  },
])
</script>
