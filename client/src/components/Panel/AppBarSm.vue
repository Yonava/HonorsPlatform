<template>
  <AppBarNavDrawer
    v-model="open"
    :color="color"
  />
  <v-app-bar
    :color="color"
    v-bind="$attrs"
  >
    <PanelTitle />
    <v-spacer></v-spacer>

    <div
      class="d-flex"
      style="gap: 4px"
    >
      <v-btn
        icon
      >
        <v-icon
          icon="mdi-magnify"
          size="large"
        ></v-icon>
      </v-btn>

      <v-btn
        @click="open = true"
        icon
      >
        <v-icon
          icon="mdi-menu"
          size="large"
        ></v-icon>
      </v-btn>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import PanelTitle from "./PanelTitle.vue";
import AppBarNavDrawer from "./AppBarNavDrawer.vue";
import { ref } from "vue";

const open = ref(false)

defineProps<{
  color: string
}>()
</script>