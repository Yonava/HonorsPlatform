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
      elevation="10"
    >
      <h2 class="mb-5">
        Click below to re-attempt authorization
      </h2>
      <v-btn 
        @click="authorize"
        rounded
      >
        Attempt Authorization
      </v-btn>
      <div class="mt-7">
        <p style="font-weight: 900;">
          Authorization failed, this could be due to one of the following reasons:
        </p>
        <ol class="ml-4">
          <li>
            Dr. Matthews has not authorized you to use this application
          </li>
          <li>
            Your previous credentials have expired
          </li>
          <li>
            Your internet is garbage
          </li>
        </ol>
      </div>
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const loading = ref(true)

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 1000)
  localStorage.setItem('token', route.query.code as string)
  if (route.query.hold) return
  router.push({ name: 'panel' })
})

const authorize = async () => {
  const response = await axios.get('/api/auth/url')
  const url = response.data.url
  location.replace(url)
}
</script>

<style scoped>
.logo {
  width: 300px;
  height: 200px;
  object-fit: cover;
  mix-blend-mode: multiply;
}
</style>