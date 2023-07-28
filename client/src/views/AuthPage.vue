<template>
  <v-sheet
    class="d-flex align-center justify-center flex-column"
    height="100%"
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
      class="d-flex align-center justify-center flex-column"
    >
      <div class="mb-8 d-flex flex-row align-center">
        <h1 style="font-size: 250%">
          Authorize
        </h1>
      </div>
      <v-btn
        @click="forceAuthorize()"
        color="red-darken-2"
        elevation="3"
        class="mb-12"
        size="x-large"
      >
        <v-icon class="mr-2">mdi-google</v-icon>
        Continue With Google
      </v-btn>
      <div style="max-width: 450px; width: 80%" class="mb-10">
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
import { local } from '../Locals'

const route = useRoute()
const router = useRouter()
const loading = ref(true)

const auth = useAuth()
const { forceAuthorize, userLoginFlow } = auth

onMounted(async () => {
  // check if google servers have redirected with a code
  const code = (route.query.code ?? '') as string
  const closeTab = (route.query.close ?? '') as string
  if (!code) {
    loading.value = false
    return
  }

  if (closeTab) {
    localStorage.setItem(local.googleOAuthCode, code)
    window.close()
    return
  }

  await userLoginFlow(code)

  router.push({
    name: 'panel'
  })
})
</script>

<style scoped>
.logo {
  width: 400px;
}
</style>