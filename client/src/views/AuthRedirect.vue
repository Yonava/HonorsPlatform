<template>
  <div
    :style="{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw'
    }"
  >
    <v-progress-circular
      indeterminate
      color="blue-darken-2"
      size="64"
    ></v-progress-circular>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { local } from '../Locals';
import { useRoute } from 'vue-router';

const route = useRoute()

onMounted(() => {
  const code = (route.query.code ?? '') as string

  if (code) {
    localStorage.setItem(local.googleOAuthCode, code)
  } else {
    console.error('No code provided in redirect URL')
    return
  }

  window.close()
});
</script>