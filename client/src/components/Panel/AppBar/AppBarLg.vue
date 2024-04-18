<template>
  <v-app-bar :color="color">

    <PanelTitle />

    <AppBarSearch class="ml-4" />

    <v-spacer></v-spacer>

    <div
      class="mr-4"
      style="height: 40px"
    >
      <ActiveAccounts justify="right" />
    </div>

    <AddItemBtn />

    <div
      class="d-flex justify-space-around ml-4"
      style="width: 100px;"
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
import Announcements from "../Announcements/AnnouncementMenu.vue";
import AdditionalTools from "./AdditionalTools.vue";
import ActiveAccounts from "./ActiveAccounts.vue";

defineProps<{
  color: string
}>()
</script>