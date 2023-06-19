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
      position="absolute"
      class="d-flex align-center justify-center flex-column ma-5"
    >
      <div class="my-8 d-flex flex-row align-center">
        <h1 style="font-size: 250%">
          Authorize
        </h1>
      </div>
      <v-btn
        @click="forceAuthorize()"
        color="red-darken-2"
        elevation="3"
        class="mb-12"
        :size="xs ? 'default' : 'x-large'"
      >
        <v-icon class="mr-2">mdi-google</v-icon>
        Continue With Google
      </v-btn>
      <div>
        <v-expansion-panels variant="accordion">
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
                    Your internet connection is unstable
                  </li>
                  <li>
                    You attempted to perform an operation you are
                    not authorized to perform (i.e. generating registrar reports)
                  </li>
                  <li>
                    You are not whitelisted as a Honors Program staff member
                  </li>
                </ol>
              </div>
            </template>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../store/useAuth'
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useDisplay } from 'vuetify'

const { xs } = useDisplay()

const route = useRoute()
const router = useRouter()
const loading = ref(true)

const { forceAuthorize, setToken } = useAuth()

onMounted(async () => {
  // check if google servers has redirected with a code
  const code = (route.query.code ?? '') as string
  if (!code) {
    loading.value = false
    return
  }

  // if so, exchange code for access token and store it (useAuth will pick up on it)
  const res = await axios.get(`/api/auth/${encodeURIComponent(code)}`)
  const token = res.data.accessToken
  if (!token) {
    loading.value = false
    throw new Error('No access token received')
  }
  setToken(token)
  window.close()
  router.push({
    name: 'panel'
  })
})
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