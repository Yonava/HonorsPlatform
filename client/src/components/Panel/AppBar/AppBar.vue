<template>
  <AppBarLg
    v-if="mdAndUp"
    :color="appBarColor"
    class="px-5"
  />
  <AppBarSm
    v-else
    :color="appBarColor"
    class="px-5"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useDisplay } from "vuetify";
import { useSheetManager } from "@store/useSheetManager";
import AppBarLg from "../AppBar/AppBarLg.vue";
import AppBarSm from "../AppBar/AppBarSm.vue";

const { getActivePanel } = storeToRefs(useSheetManager());

const { mdAndUp } = useDisplay();
const appBarColor = computed(() => getActivePanel.value.color + '-darken-2')
</script>