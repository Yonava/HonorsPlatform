<template>
  <v-sheet 
    class="d-flex align-center justify-center flex-column"
    height="100vh"
    width="100vw"
    color="blue-lighten-3"
  >
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="blue-darken-2"
      size="64"
    ></v-progress-circular>
    <img
      v-if="!loading"
      src="../assets/honorsLogo.png"
      class="logo mb-7"
    />
    <v-sheet 
      v-if="!loading"
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
const loading = ref(true)

onMounted(() => {
  localStorage.setItem('token', route.query.code as string)
  router.push({ name: 'panel' })
  setTimeout(() => {
    loading.value = false
  }, 2000)
})
</script>

<style scoped>
.logo {
  width: 300px;
  height: 200px;
  object-fit: cover;
  mix-blend-mode: multiply;
}
</style>