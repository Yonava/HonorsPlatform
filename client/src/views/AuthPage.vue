<template>
  <v-sheet 
    class="d-flex align-center justify-center flex-column"
    height="100vh"
    width="100vw"
  >
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="blue-darken-2"
      size="64"
    ></v-progress-circular>
    <img
      v-if="!loading"
      src="../assets/honorsLogo.jpeg"
      class="logo"
    />
    <v-sheet 
      v-if="!loading"
      class="d-flex align-center justify-center flex-column ma-5"
    >
      <div class="mb-8 d-flex flex-row align-center">
        <!-- <v-icon 
          class="mr-3"
          size="x-large"
        >mdi-alert</v-icon> -->
        <h1 style="font-size: 250%">
          Not Authorized
        </h1>
      </div>
      <v-btn 
        @click="authorize"
        color="red-darken-2"
        elevation="3"
        class="mb-12"
        size="x-large"
      >
        <v-icon class="mr-2">mdi-google</v-icon>
        Continue With Google
      </v-btn>
      <v-expansion-panels>
        <v-expansion-panel 
          elevation="0"
          color="grey-lighten-3"
        >
          <template #title>
            <v-icon class="mr-2">mdi-information-outline</v-icon>
            <p>Why Am I Seeing This?</p>
          </template>
          <template #text>
            <div>
              <h3 style="font-weight: 900;">
                This could be due to one of the following reasons:
              </h3>
              <ol class="ml-4">
                <li>
                  Your previous credentials have expired
                </li>
                <li>
                  Your internet is garbage
                </li>
                <li>
                  You attempted to perform an operation you are 
                  not authorized to perform (i.e. generating registrar reports)
                </li>
                <li>
                  Dr. Matthews doesn't like you
                </li>
              </ol>
            </div>
          </template>
        </v-expansion-panel>
      </v-expansion-panels>
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
  router.push({ 
    name: 'panel' 
  })
})

const authorize = async () => {
  try {
    const response = await axios.get('/api/auth/url')
    if (!response.data.url) throw new Error('No URL')
    const url = response.data.url
    location.replace(url)
  } catch (error) {
    console.log(error)
  }
}
</script>

<style scoped>
.logo {
  position: absolute;
  top: 20px;
  width: 300px;
  object-fit: cover;
  mix-blend-mode: multiply;
}
</style>