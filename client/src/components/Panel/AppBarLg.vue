<template>
  <v-app-bar :color="color">
    <PanelTitle />
    <AppBarSearch class="ml-4" />
    <v-spacer></v-spacer>
    <AddItemBtn />
    <div
      class="d-flex justify-space-around ml-4"
      style="width: 100px"
    >
      <Announcements />
      <AdditionalTools />
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import PanelTitle from "./PanelTitle.vue";
import AppBarSearch from "./AppBarSearch.vue";
import AddItemBtn from "./AddItemBtn.vue";
import Announcements from "./AnnouncementMenu.vue";
import AdditionalTools from "./AdditionalTools.vue";

defineProps<{
  color: string
}>()
</script>