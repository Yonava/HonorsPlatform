<template>
  <v-app>
    <router-view />
    <ServeSnackbar />
    <ServeDialog />
  </v-app>
</template>

<script setup lang="ts">
import ServeSnackbar from './ServeSnackbar.vue';
import ServeDialog from './ServeDialog.vue';
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');

body {
  font-family: "Roboto";
}
</style>