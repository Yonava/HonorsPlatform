<template>
  <v-sheet 
    class="d-flex align-center justify-center flex-column"
    height="100vh"
    width="100vw"
    color="blue-lighten-3"
  >
    <img
      src="../assets/honorsLogo.png"
      style="margin-bottom: 10px; border-radius: 5px; width: 300px; height: 200px; object-fit: cover; mix-blend-mode: multiply;"
    />
    <v-sheet 
      color="blue-darken-2"
      class="d-flex align-center justify-center flex-column pa-5"
      style="border-radius: 10px;"
    >
      <h2 class="mb-3">
        Click to attempt authorization
      </h2>
      
      <v-btn @click="$router.push('/panel')">
        Authorize
      </v-btn>
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  localStorage.setItem('token', route.query.code as string)
  router.push({ name: 'panel' })
})
</script>