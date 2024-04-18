<template>
  <div class="d-flex my-2">

    <div class="d-flex align-center mb-4">
      <v-icon
        size="x-large"
        class="mr-3"
      >
        mdi-bullhorn-variant
      </v-icon>
      <h1
        style="line-height: 1"
      >
        Announcements
      </h1>
    </div>

    <v-spacer></v-spacer>

    <v-btn
      v-if="!smAndDown"
      @click.stop="makeAnnouncement"
      :color="getActivePanel.color"
      icon
      size="small"
    >
      <v-icon>
        mdi-plus
      </v-icon>
      <v-tooltip activator="parent">
        Make Announcement
      </v-tooltip>
    </v-btn>

  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useDisplay } from "vuetify";
import { useDialog } from "@store/useDialog";
import { useSheetManager } from "@store/useSheetManager";
import PostAnnouncement from "@components/Panel/Announcements/PostAnnouncement.vue";

const { smAndDown } = useDisplay();

const sheetManager = useSheetManager();
const { getActivePanel } = storeToRefs(sheetManager);
const { open } = useDialog();

const makeAnnouncement = () => {
  open({ component: PostAnnouncement });
};
</script>