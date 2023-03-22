<template>
  <div>
    auth
    <v-btn @click="$router.push('/panel')">retry</v-btn>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  if (!route.query.code) {
    return
  }
  localStorage.setItem('token', route.query.code as string)
  router.push({ name: 'panel' })
})
</script>