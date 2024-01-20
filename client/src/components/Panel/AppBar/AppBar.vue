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
import AppBarLg from "../AppBar/AppBarLg.vue";
import AppBarSm from "../AppBar/AppBarSm.vue";
import { computed } from "vue";
import { useDisplay } from "vuetify";
import { useSheetManager } from "../../../store/useSheetManager";
import { storeToRefs } from "pinia";

const { getActivePanel } = storeToRefs(useSheetManager());

const { mdAndUp } = useDisplay();
const appBarColor = computed(() => getActivePanel.value.color + '-darken-2')
</script>