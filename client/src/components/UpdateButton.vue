<template>
  <v-btn 
    icon
    :loading="syncState.processing"
    :color="syncState.status ? 'green' : `red-darken-2`"
    :style="{
      cursor: syncState.status ? 'default' : 'pointer',
    }"
    rounded
    class="ml-7"
  >
    <v-icon
      :icon="syncState.status ? 'mdi-check' : 'mdi-cloud-upload'"
    ></v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { inject } from "vue";
import type { Ref } from "vue";
import type { SyncState } from "../SheetItemUpdateManager";

const syncState = inject<Ref<SyncState>>("syncState");
</script>