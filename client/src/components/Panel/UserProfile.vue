<template>
  <v-sheet
    v-if="googleProfile"
    @click.stop
    class="d-flex flex-column align-center"
    style="border-radius: 20px; min-width: 350px; max-width: 450px"
  >
    <v-sheet class="pa-4 d-flex flex-column align-center" style="width: 100%">
      <div style="width: 100px; height: 100px; position: relative">
        <img
          :src="googleProfile.picture"
          :alt="`Profile picture for ${googleProfile.name}`"
          :style="{
            borderRadius: '50%',
            width: '100%',
            aspectRatio: '1 / 1',
            objectFit: 'cover',
            boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
          }"
        />

        <v-btn
          v-if="!readOnlyMode"
          @click="makeAnnouncement"
          class="my-3"
          style="position: absolute; bottom: -17%; right: -7%"
          :color="getActivePanel.color + '-darken-1'"
          icon
          size="small"
        >
          <v-icon> mdi-bullhorn-outline </v-icon>
          <v-tooltip activator="parent">
            Make Announcement as {{ googleProfile.given_name }}
          </v-tooltip>
        </v-btn>
      </div>

      <v-sheet
        color="white"
        style="width: 100%"
        class="pa-3 d-flex flex-column align-center"
      >
        <h1>
          {{ googleProfile.name }}
        </h1>
        <div class="d-flex flex-row align-center">
          <p v-if="lastLogin" style="font-size: 0.9rem">
            logged in at {{ lastLogin }}
            <span v-if="minutesSinceLastLogin">
              ({{ minutesSinceLastLogin }} min. ago)
            </span>
            <span v-else> (just now) </span>
          </p>
          <InfoBtn class="ml-1">
            Authorization expires every hour for security reasons
          </InfoBtn>
        </div>
        <div
          class="my-4"
          style="width: 100%; height: 1px; background: rgb(106, 106, 106)"
        ></div>
        <v-sheet style="width: 100%">
          <h3 class="mb-2">Active On:</h3>
          <v-sheet
            :color="getActivePanel.color + '-darken-1'"
            style="width: 100%; border-radius: 10px"
            class="pa-1 d-flex align-center flex-column justify-center"
          >
            <div class="d-flex flex-row align-center" style="gap: 7px">
              <v-icon size="large">
                {{ getActivePanel.icon }}
              </v-icon>
              <h2>
                {{ getActivePanel.title.plural }}
              </h2>
            </div>
            <div
              v-if="itemFocused"
              class="my-2"
              style="width: 90%; height: 2px; background: white"
            ></div>
            <div v-if="itemFocused">
              <h2>
                {{
                  itemFocused[getActivePanel.properties.title] || "(Untitled)"
                }}
              </h2>
            </div>
          </v-sheet>
        </v-sheet>
      </v-sheet>
    </v-sheet>
    <div class="mb-8"></div>
    <v-sheet
      @click="logout"
      color="red"
      :style="logoutButtonStyle"
      class="py-1"
    >
      <h2>Logout</h2>
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, StyleValue } from "vue";
import { storeToRefs } from "pinia";
import { useAuth } from "@store/useAuth";
import { useSheetManager } from "@store/useSheetManager";
import { useDocumentCache } from "@store/useDocumentCache";
import { useDialog } from "@store/useDialog";
import { local } from "@locals";
import PostAnnouncement from "./PostAnnouncement.vue";
import InfoBtn from "./InfoBtn.vue";

const auth = useAuth();
const { userLogoutFlow } = auth;
const { googleProfile } = storeToRefs(auth);

const sheetManager = useSheetManager();
const { getActivePanel, focusedItemSysId, readOnlyMode } =
  storeToRefs(sheetManager);

const { getItemBySysId } = useDocumentCache();

const lastLoginStore = local.get('last-auth');

const lastLogin = computed(() => {
  if (lastLoginStore) {
    const date = new Date(parseInt(lastLoginStore));
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "numeric",
    });
  }
  return false;
});

const logoutButtonStyle = {
  position: "absolute",
  bottom: "0",
  width: "100%",
  boxShadow: "0 0 5px rgba(0, 0, 0, 0.3)",
  cursor: "pointer",
  textAlign: "center",
  borderRadius: "0 0 20px 20px",
} satisfies StyleValue;

const minutesSinceLastLogin = computed(() => {
  if (lastLoginStore) {
    const date = new Date(parseInt(lastLoginStore));
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.floor(diff / 1000 / 60);
  }
  return false;
});

const itemFocused = computed(() => {
  if (focusedItemSysId.value) {
    return getItemBySysId(focusedItemSysId.value);
  }
  return false;
});

const makeAnnouncement = () => {
  const { open } = useDialog();
  open({ component: PostAnnouncement });
};

const logout = () => {
  userLogoutFlow({
    goToAuthPage: true,
    error: "LOGOUT",
    broadcastLogoutEvent: true,
  });
};
</script>