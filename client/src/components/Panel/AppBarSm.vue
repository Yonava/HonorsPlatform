<template>
  <AppBarNavDrawer
    v-model="open"
    :color="color"
  />
  <v-app-bar
    :color="color"
    v-bind="$attrs"
  >
    <AppBarSearch
      v-if="searching"
      style="width: 100%"
      class="mr-3"
    />
    <PanelTitle v-else />
    <v-spacer v-if="!searching"></v-spacer>
    <div
      class="d-flex"
      style="gap: 4px"
    >
      <v-btn
        @click="searching = !searching"
        icon
      >
        <v-icon
          :icon="searchIcon"
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
import AppBarSearch from "./AppBarSearch.vue";
import { ref, computed } from "vue";

const open = ref(false)
const searching = ref(false)
const searchIcon = computed(() => searching.value ? "mdi-close" : "mdi-magnify")

defineProps<{
  color: string
}>()
</script>