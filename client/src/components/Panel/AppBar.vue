<template>
  <div>
    <v-navigation-drawer
      v-model="navDrawer"
      temporary
      fixed
      location="end"
      :color="`${panel.color}-darken-2`"
      style="
        width: 75%;
        max-width: 350px;
        height: 120vh;
        position: fixed;
        top: 0;
      "
    >
      <div class="pa-4">
        <div class="d-flex flex-row" style="width: 100%">
          <v-btn icon>
            <v-icon
              @click="$router.push({ name: 'leaderboard' })"
              icon="mdi-podium"
              size="large"
            ></v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <Announcements />
        </div>
        <v-btn
          @click="emit('showAddModal')"
          style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240)"
          class="mt-5"
          block
        >
          <v-icon icon="mdi-plus" size="large" class="mr-2"></v-icon>
          Add {{ panel.title.singular }}
        </v-btn>
        <v-btn
          @click="fetchItems"
          :loading="loading"
          style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240)"
          class="mt-3"
          block
        >
          <v-icon icon="mdi-refresh" size="large" class="mr-2"></v-icon>
          Refresh Data
        </v-btn>
        <v-btn
          @click="$router.push({ name: 'registrar' })"
          style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240)"
          class="mt-3"
          block
        >
          <v-icon
            icon="mdi-list-box-outline"
            size="large"
            class="mr-2"
          ></v-icon>
          Registrar List
        </v-btn>
        <v-btn
          @click="$router.push({ name: 'email' })"
          style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240)"
          class="mt-3"
          block
        >
          <v-icon
            icon="mdi-email-fast-outline"
            size="large"
            class="mr-2"
          ></v-icon>
          Mass Email
        </v-btn>
        <AdditionalTools>
          <v-btn
            @click="showTools = !showTools"
            style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240)"
            class="mt-3"
            block
          >
            <v-icon icon="mdi-hammer" size="large" class="mr-2"></v-icon>
            Additional Tools
          </v-btn>
        </AdditionalTools>
        <SortPanel class="mt-5" />
      </div>
    </v-navigation-drawer>
    <v-app-bar :color="`${panel.color}-darken-2`" class="app-bar px-5">
      <div v-if="searchMode">
        <input
          v-model="searchFilter"
          :placeholder="filterPlaceholder"
          class="vanilla-search-input"
          type="text"
          id="input"
        />
      </div>
      <div v-else class="d-flex align-center">
        <v-icon :icon="panel.icon" size="x-large" class="mr-2"></v-icon>
        <v-menu>
          <template v-slot:activator="{ props }">
            <h1 v-bind="props" class="title">
              {{ panelTitle }}
            </h1>
          </template>

          <v-list>
            <v-list-item
              v-for="listPanel in panels"
              :key="listPanel.title.singular"
              @click="setPanel(listPanel)"
              class="type-list-item"
            >
              <v-list-item-title
                :style="panelItemColor(listPanel)"
                class="type-list-text"
              >
                <v-icon>
                  {{ listPanel.icon }}
                </v-icon>
                {{ listPanel.title.plural }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <p
          :style="{
            opacity: loadingItems ? 0 : 1,
          }"
          class="ml-2"
        >
          ({{ filteredItems.length }})
        </p>
      </div>
      <input
        v-if="mdAndUp"
        v-model="searchFilter"
        :placeholder="filterPlaceholder"
        class="search-input"
        type="text"
        id="input"
      />
      <v-spacer></v-spacer>
      <v-btn
        v-if="smAndUp"
        @click="$emit('showAddModal')"
        class="ml-3"
        style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240)"
      >
        <v-icon icon="mdi-plus" size="large"></v-icon>
        <span v-if="mdAndUp" class="ml-2">
          Add {{ panel.title.singular }}
        </span>
      </v-btn>
      <v-btn
        v-if="smAndUp"
        @click="fetchItems"
        :loading="loadingItems"
        class="ml-3"
        style="background: rgba(0, 0, 0, 0.4); color: rgb(240, 240, 240)"
      >
        <v-icon icon="mdi-refresh" size="large"></v-icon>
        <span v-if="mdAndUp" class="ml-2"> Refresh Data </span>
      </v-btn>
      <v-btn v-if="!mdAndUp" class="ml-3" icon>
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
        :class="[mdAndUp ? 'ml-3' : '', 'd-flex', 'flex-row', 'align-center']"
      >
        <Announcements />
        <AdditionalTools>
          <template #showing="{ showing }">
            <v-btn icon>
              <v-icon icon="mdi-hammer" size="large"></v-icon>
              <v-tooltip
                :disabled="smAndDown || showing"
                activator="parent"
                location="bottom"
                >Additional Tools</v-tooltip
              >
            </v-btn>
          </template>
        </AdditionalTools>
        <v-btn icon>
          <v-icon
            @click="$router.push({ name: 'leaderboard' })"
            icon="mdi-podium"
            size="large"
          ></v-icon>
          <v-tooltip :disabled="smAndDown" activator="parent" location="bottom"
            >View Points Leaderboard</v-tooltip
          >
        </v-btn>
      </div>
      <div v-else>
        <v-btn icon>
          <v-icon
            @click="navDrawer = true"
            icon="mdi-menu"
            size="large"
          ></v-icon>
        </v-btn>
      </div>
    </v-app-bar>
  </div>
</template>

<script setup lang="ts">
import SortPanel from "./SortPanel.vue";
import Announcements from "./AnnouncementMenu.vue";
import AdditionalTools from "../../components/Panel/AdditionalTools.vue";

import { ref, computed, watch } from "vue";
import { useDisplay } from "vuetify";
import { useKeyBindings } from "../../KeyBindings";

import { panels, Panel } from "../../Panels";
import { useSheetManager } from "../../store/useSheetManager";
import { mapActions, storeToRefs } from "pinia";

const sheetManager = useSheetManager();
const { setSearchFilter, setPanel, fetchItems } = mapActions(useSheetManager, [
  "setSearchFilter",
  "setPanel",
  "fetchItems",
]);
const { searchFilter, panel, selectedItem, loadingItems, filteredItems } = storeToRefs(sheetManager);

const searchText = computed({
  get: () => searchFilter.value,
  set: (value) => setSearchFilter(value),
});

const navDrawer = ref(false);
const searchMode = ref(false);

useKeyBindings({
  "/": () => document.getElementById("input").focus(),
});

const { lgAndUp, mdAndUp, smAndUp, smAndDown, xs } = useDisplay();

const emit = defineEmits(["showAddModal"]);

function panelItemColor(panelParam: Panel) {
  return {
    color:
      panel.value.title.singular === panelParam.title.singular
        ? panel.value.color
        : "black",
  };
}

const filterPlaceholder = computed(() => {
  return `Search ${panelTitle.value.toLowerCase()}...`;
});

const panelTitle = computed(() => {
  const title = panel.value.title.plural;
  if (lgAndUp.value || title.split(" ").length <= 1) return title;
  else {
    return title.split(" ")[1];
  }
});

watch(selectedItem, () => {
  navDrawer.value = false;
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

.type-list-item {
  cursor: pointer;
  transition: 0.2s ease;
}

.type-list-item:hover {
  background: rgba(0, 0, 0, 0.1);
}

.type-list-text {
  font-size: 1.2em;
  font-weight: 700;
  text-transform: capitalize;
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
  width: 300px;
  max-width: 70vw;
  font-size: 1.4em;
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