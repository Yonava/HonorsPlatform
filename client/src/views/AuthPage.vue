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
        <div style="max-width: 450px; text-align: center;">
          <h1 style="font-size: 250%;">
            {{ title.large }}
          </h1>
          <p
            v-if="title.small"
            class="mt-2"
            style="color: red; font-weight: bold;"
          >
            {{ title.small }}
          </p>
        </div>
      </div>
      <v-btn
        @click="authorize()"
        color="red-darken-2"
        elevation="3"
        class="mb-12"
        size="x-large"
      >
        <v-icon class="mr-2">mdi-google</v-icon>
        Continue With Google
      </v-btn>
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth, type ServerError } from '@store/useAuth'
import { local, localKeys } from '@locals'

const route = useRoute()
const router = useRouter()
const loading = ref(true)

const error = route.query.error as ServerError | undefined
const title = computed(() => {
  switch (error) {
    case 'access_denied':
      return {
        large: 'Incomplete Login',
        small: 'Google Has Indicated That It Was Unable To Complete The Login Process, Please Try Again'
      }
    case 'NO_SHEET_ACCESS':
      return {
        large: 'Access Not Granted',
        small: 'The Google Account You Have Attempted To Logged In With Has Not Been Granted Access To The Honors Program, Please Contact Dr. Matthews For Further Assistance'
      }
    case 'SESSION_EXPIRED':
      return {
        large: 'Session Expired',
        small: 'Your Session Has Expired, Please Login Again'
      }
    case 'REMOTE_LOGOUT':
      return {
        large: 'Logged Out',
        small: 'You Have Been Logged Out Of Your Account From Another Device or Browser, Please Login Again'
      }
    case 'LOGOUT':
      return {
        large: 'Logged Out',
      }
    default:
      return {
        large: 'Authorize'
      }
  }
})

const auth = useAuth()
const { endSessionAndPromptOAuth: authorize, userLoginFlow } = auth

onMounted(async () => {
  // check if google servers have redirected with a code
  const code = (route.query.code ?? '') as string
  if (!code) {
    loading.value = false
    return
  }

  const close = local.get(localKeys.closeAfterAuth)
  if (close) {
    local.set(localKeys.googleOAuthCode, code)
    window.close()
    if (window.closed) {
      return
    }
  }

  try {
    await userLoginFlow(code)
  } catch (e) {
    console.error('userloginflow error', e)
  }

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