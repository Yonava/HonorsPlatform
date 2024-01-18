<template>
  <v-app-bar :color="color">
    <PanelTitle />
    <AppBarSearch />
    <v-spacer></v-spacer>
    <div style="width: 175px">
      <AddItemBtn />
    </div>
    <Announcements />
  </v-app-bar>
</template>

<script setup lang="ts">
import PanelTitle from "./PanelTitle.vue";
import AppBarSearch from "./AppBarSearch.vue";
import AddItemBtn from "./AddItemBtn.vue";
import Announcements from "./AnnouncementMenu.vue";

defineProps<{
  color: string
}>()
</script>