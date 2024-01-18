<template>
  <div>
    <AppBarLg
      v-if="mdAndUp"
      :color="appBarColor"
      class="app-bar px-5"
    />
    <AppBarSm
      v-else
      :color="appBarColor"
      class="app-bar px-5"
    />
  </div>
  <!-- <div>
    <v-navigation-drawer
      v-if="xs"
      v-model="navDrawer"
      temporary
      fixed
      location="end"
      :color="appBarColor"
      style="
        width: 75%;
        max-width: 350px;
        height: 100vh;
        position: fixed;
        top: 0;
      "
      class="pa-4"
    >
      <div class="d-flex">
        <ActiveAccounts />
        <v-spacer></v-spacer>
        <Announcements />
      </div>

      <NavDrawerBlockBtn
        @click="add.fire"
        :disabled="readOnlyMode"
        :loading="add.loading"
        :icon="addIcon"
      >
        Add {{ getActivePanel.title.singular }}
      </NavDrawerBlockBtn>

      <NavDrawerBlockBtn
        @click="registrarAction"
        :disabled="readOnlyMode"
        icon="mdi-list-box-outline"
      >
        Create Registrar List
      </NavDrawerBlockBtn>

      <NavDrawerBlockBtn
        @click="emailAction"
        icon="mdi-email-outline"
      >
        Compose Mass Email
      </NavDrawerBlockBtn>

      <AdditionalTools>
        <template #showing="{ toolsAvailable }">
          <NavDrawerBlockBtn
            v-if="toolsAvailable"
            icon="mdi-hammer"
          >
            Additional Tools
          </NavDrawerBlockBtn>
        </template>
      </AdditionalTools>

      <div style="overflow: auto; max-height: 50vh">
        <SortPanel class="mt-5" />
      </div>

      <span style="font-size: 10px; position: absolute; bottom: 10px;">
        {{ version }}
      </span>

    </v-navigation-drawer>

    <v-app-bar
      :color="appBarColor"
      class="app-bar px-5"
    >

      <div
        v-if="searchMode"
        style="width: 100%;"
      >
        <input
          v-model="searchText"
          placeholder="Search"
          class="vanilla-search-input"
          type="text"
          id="input"
        />
      </div>

      <PanelTitle v-else />

      <input
        v-if="mdAndUp"
        v-model="searchText"
        placeholder="Search"
        class="search-input"
        type="text"
        id="input"
      />

      <v-spacer></v-spacer>

      <ActiveAccounts v-if="smAndUp" />

      <v-btn
        v-if="smAndUp && getActivePanel.add"
        @click="add.fire"
        :disabled="readOnlyMode"
        :loading="add.loading"
        :style="{
          background: add.success ? 'rgb(34, 159, 34)' : 'rgba(0, 0, 0, 0.4)',
          color: 'rgb(240, 240, 240)'
        }"
        class="ml-3"
      >
        <v-icon size="large">
          {{ add.success ? 'mdi-check' : 'mdi-plus' }}
        </v-icon>
        <span
          v-if="mdAndUp"
          class="ml-2"
        >
          Add {{ getActivePanel.title.singular }}
        </span>
      </v-btn>

      <v-btn
        v-if="!mdAndUp"
        class="ml-3"
        icon
      >
        <v-icon
          v-if="!searchMode"
          @click="searchMode = true"
          icon="mdi-magnify"
          size="large"
        ></v-icon>

        <v-icon
          v-else
          @click="searchMode = false"
          icon="mdi-close"
          size="large"
        ></v-icon>
      </v-btn>

      <div
        v-if="smAndUp"
        :class="[
          mdAndUp ? 'ml-3' : '',
          'd-flex',
          'flex-row',
          'align-center'
        ]"
      >

        <Announcements />

        <AdditionalTools>
          <template #showing="{ showing, toolsAvailable }">

            <v-btn
              v-if="toolsAvailable"
              icon
            >

              <v-icon
                icon="mdi-hammer"
                size="large"
              ></v-icon>

              <v-tooltip
                :disabled="smAndDown || showing"
                activator="parent"
                location="bottom"
              >
                Additional Tools
              </v-tooltip>

            </v-btn>

          </template>
        </AdditionalTools>
      </div>

      <div v-else-if="!searchMode">

        <v-btn icon>
          <v-icon
            @click="navDrawer = true"
            icon="mdi-menu"
            size="large"
          ></v-icon>
        </v-btn>

      </div>
    </v-app-bar>
  </div> -->
</template>

<script setup lang="ts">
import AppBarLg from "./AppBarLg.vue";
import AppBarSm from "./AppBarSm.vue";

import SortPanel from "./SortPanel.vue";
import Announcements from "./AnnouncementMenu.vue";
import AdditionalTools from "../../components/Panel/AdditionalTools.vue";
import PanelTitle from "./PanelTitle.vue";
import ActiveAccounts from "./ActiveAccounts.vue";
import NavDrawerBlockBtn from "./NavDrawerBlockBtn.vue";
import BuildRegistrarList from "./BuildRegistrarList.vue";
import MassEmailMenu from "./MassEmailMenu.vue";

import { ref, computed, watchEffect } from "vue";
import { useDisplay } from "vuetify";
import { useKeyBindings } from "../../KeyBindings";
import { useDialog } from '../../store/useDialog'

import { version } from "../../Panels";
import { useSheetManager } from "../../store/useSheetManager";
import { useDocumentCache } from "../../store/useDocumentCache";
import { storeToRefs } from "pinia";

const { show: dialogOpen } = storeToRefs(useDialog())
const { getSelectedItems } = useDocumentCache();
const { searchFilter, getActivePanel, readOnlyMode } = storeToRefs(useSheetManager());
const { setSearchFilter } = useSheetManager();

const navDrawer = ref(false);
const searchMode = ref(false);

const registrarAction = () => {
  useDialog().open({
    component: {
      render: BuildRegistrarList
    },
  })
}

const emailAction = () => {
  useDialog().open({
    component: {
      render: MassEmailMenu
    },
  })
}

const add = ref({
  loading: false,
  success: false,
  fire: async () => {
    if (!getActivePanel.value.add) return;
    if (add.value.loading || add.value.success) return;
    add.value.loading = true;
    await getActivePanel.value.add();
    add.value.loading = false;
    add.value.success = true;
    setTimeout(() => {
      add.value.success = false;
    }, 3000);
  },
});

const addIcon = computed(() => {
  return add.value.success ? "mdi-check" : "mdi-plus";
});

useKeyBindings({
  "/": () => document.getElementById("input")!.focus(),
  "a": () => add.value.fire(),
});

const { mdAndUp, smAndUp, smAndDown, xs } = useDisplay();

const appBarColor = computed(() => {
  return getActivePanel.value.color + '-darken-2'
})

watchEffect(() => {
  if (dialogOpen.value || getSelectedItems().length > 0) {
    navDrawer.value = false;
  }
});

watchEffect(() => {
  if (getActivePanel.value) {
    add.value.loading = false;
    add.value.success = false;
  }
});
</script>

<style scoped>
.app-bar {
  transition: 300ms;
}

h1.title {
  font-weight: 700;
  user-select: none;
  cursor: pointer;
  white-space: nowrap;
}

.search-input {
  background: rgba(0, 0, 0, 0.3);
  color: rgb(240, 240, 240);
  border-radius: 50px;
  padding: 3px;
  padding-left: 15px;
  border: none;
  width: 30%;
  max-width: 800px;
  font-size: 1.4em;
  font-weight: 200;
  box-shadow: 2px 1px 4px rgba(0, 0, 0, 0.5);
  margin-left: 25px;
  transition: 0.3s ease;
}

.vanilla-search-input {
  background: rgba(0, 0, 0, 0.3);
  color: rgb(240, 240, 240);
  border-radius: 50px;
  padding: 3px;
  padding-left: 15px;
  border: none;
  font-size: 1.4em;
  width: 100%;
  font-weight: 200;
  box-shadow: 2px 1px 4px rgba(0, 0, 0, 0.5);
}

.vanilla-search-input:focus {
  box-shadow: 3px 2px 9px rgba(0, 0, 0, 0.5);
  outline: none;
}

.search-input:focus {
  box-shadow: 3px 2px 9px rgba(0, 0, 0, 0.5);
  outline: none;
}

.search-input:focus::placeholder {
  color: transparent;
}

.search-input:hover {
  box-shadow: 3px 2px 9px rgba(0, 0, 0, 0.5);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.569);
}

.vanilla-search-input:focus::placeholder {
  color: transparent;
}

.vanilla-search-input:hover {
  box-shadow: 3px 2px 9px rgba(0, 0, 0, 0.5);
}

.vanilla-search-input::placeholder {
  color: rgba(255, 255, 255, 0.569);
}
</style>