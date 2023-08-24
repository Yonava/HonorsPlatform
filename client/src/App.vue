<template>
  <v-app>
    <router-view />
    <ServeSnackbar />
  </v-app>
</template>

<script setup lang="ts">
import ServeSnackbar from './ServeSnackbar.vue';
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');

body {
  font-family: "Roboto";
}
</style>