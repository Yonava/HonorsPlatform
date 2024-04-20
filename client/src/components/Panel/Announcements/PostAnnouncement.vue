<template>
  <v-sheet>
    <v-card class="px-5 py-4">
      <h1 class="mb-2">
        Post An Announcement
      </h1>

      <v-textarea
        v-model="announcement"
        :disabled="posting"
        ref="announcementInput"
        label="Announcement"
        variant="outlined"
        prepend-inner-icon="mdi-message-text"
      ></v-textarea>

      <v-select
        v-model="selectedUserExpiryOption"
        :disabled="posting"
        :items="userExpiryOptions"
        variant="outlined"
        label="Remove After"
        hint="How long do you want the announcement to stay up for?"
        persistent-hint
        style="width: 100%"
        class="mb-4"
      ></v-select>

      <v-select
        v-model="associatedPanels"
        variant="outlined"
        :items="panelNames"
        chips
        multiple
        persistent-hint
        label="Post To"
        hint="Select the panels you intend to post to, or leave blank to post to all panels."
        style="width: 100%"
      ></v-select>

      <v-btn
        @click="postNewAnnouncement"
        :disabled="!announcement"
        :loading="posting"
        :color="getActivePanel.color + '-darken-1'"
        size="large"
        class="mt-4"
      >
        <v-icon class="mr-2">
          mdi-message-arrow-right
        </v-icon>
        Post
      </v-btn>
    </v-card>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { panelNames } from "@panels";
import type { PanelName } from "@panels";
import { localKeys } from "@locals";
import { useDialog } from "@store/useDialog";
import { useAuth } from "@store/useAuth";
import { useDocumentCache } from "@store/useDocumentCache";
import { useSheetManager } from "@store/useSheetManager";
import { useFocusOnMount } from "@composables/useInputFocus";

const announcementInput = ref();
useFocusOnMount(announcementInput);

const auth = useAuth();
const { user } = storeToRefs(auth);

const documentCache = useDocumentCache();
const { postAnnouncement } = documentCache;

const sheetManager = useSheetManager();
const { getActivePanel } = storeToRefs(sheetManager);

const dialog = useDialog();
const { open, close, openSnackbar } = dialog;

const announcement = useLocalStorage(localKeys.unsavedAnnouncement, "");

const posting = ref(false);

const neverExpires = [
  "When Pigs Fly 🐷🛩️",
  "MySNHU Becomes User Friendly",
  "Dine SNHU Wins A Michelin Star",
  "Frogs Start Reciting Shakespeare",
  "Doing Taxes Becomes Fun",
  "SNHU Wins A Football Game",
  "The Heat Death Of The Universe",
  "Jeff Bezos Runs Out Of Money",
  "Unicorns Are Discovered 🦄✨",
] as const;

const expiryDateOptions = {
  [neverExpires[Math.floor(Math.random() * neverExpires.length)]]: "",
  "A Day": new Date(Date.now() + 1000 * 60 * 60 * 24).toString(),
  "A Week": new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toString(),
  "A Month": new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toString(),
  "A Year": new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toString(),
  "Custom": "",
} as const;

const userExpiryOptions = Object.keys(expiryDateOptions)
const selectedUserExpiryOption = ref(userExpiryOptions[0])

const associatedPanels = ref<PanelName[]>([]);

const postNewAnnouncement = async () => {
  posting.value = true;

  if (!user.value) {
    console.error("PostAnnouncement.vue: User not found.");
    open({
      title: "Announcement Failed To Post",
      description: "You must be signed in to post an announcement.",
      buttons: [
        {
          text: "OK",
          color: "green",
          onClick: () => {
            close();
          },
        },
      ],
    });
    return;
  }

  await postAnnouncement({
    sysId: useSheetManager().newSysId(),
    content: announcement.value,
    posterName: user.value.googleProfile.name,
    posterPhoto: user.value.googleProfile.picture,
    datePosted: new Date().toString(),
    expiryDate: expiryDateOptions[selectedUserExpiryOption.value] ?? '',
    associatedPanels: associatedPanels.value.join(","),
  });

  posting.value = false;
  announcement.value = "";

  openSnackbar({
    text: "Announcement Posted",
  });

  close();
};
</script>