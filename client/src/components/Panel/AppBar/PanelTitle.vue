<template>
  <div class="d-flex align-center">
    <v-menu>
      <template v-slot:activator="{ props }">
        <div
          v-bind="props"
          class="d-flex align-center"
          style="cursor: pointer; user-select: none;"
        >
          <v-icon
            :icon="getActivePanel.icon"
            size="x-large"
            class="mr-2"
          ></v-icon>
          <h1>
            {{ panelTitle }}
          </h1>

          <h5
            :style="{
              width: '40px',
              opacity: loadingItems ? 0 : 1,
              borderRadius: '50px',
              fontWeight: '900',
            }"
            class="ml-2 px-2 text-black bg-white text-center"
          >
            {{ filteredItems.length }}
          </h5>

        </div>
      </template>

      <v-list
        @mouseleave="hoveredPanel = null"
        style="width: 350px"
      >
        <v-sheet
          v-for="panel in panels"
          @click="setPanel(panel.panelName)"
          @mouseover="hoveredPanel = panel.panelName"
          :key="panel.title.singular"
          :color="highlightItem(panel) ? panel.color + '-darken-1' : 'white'"
          class="py-2 px-4 panel-dropdown-item d-flex align-center"
          :style="{
            transition: '0.3s ease',
          }"
        >
          <span
            :style="{
              color: highlightItem(panel) ? 'white' : 'black',
              transition: '0.3s ease',
            }"
          >
            <v-icon
              class="mr-2"
              size="large"
            >
              {{ panel.icon }}
            </v-icon>
            {{ panel.title.plural }}
            <span :style="{ fontSize: '14px' }">
              ({{ documents[panel.sheetRange].value.list.length }})
            </span>
          </span>
          <v-spacer></v-spacer>
          <div
            class="d-flex align-center"
            :style="{
              transform: `translateX(${(displayAccounts(panel).length - 1) * 25}px)`,
            }"
          >
            <div
              v-for="(account, i) in displayAccounts(panel)"
              :key="account.id"
              :style="{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgb(0, 0, 0)',
                transform: `translateX(${i * -25}px)`,
                border: '2px solid rgba(255, 255, 255, 1)',
                cursor: 'pointer',
              }"
            >

              <ProfilePicture :src="account.picture" />

              <v-tooltip
                activator="parent"
                location="bottom"
              >
                {{ account.given_name }}
              </v-tooltip>

            </div>
          </div>
        </v-sheet>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useDisplay } from "vuetify";
import { panels, type Panel, type PanelName } from "@panels";
import { useSheetManager } from "@store/useSheetManager";
import { useSocket } from "@store/useSocket";
import { useDocumentCache } from "@store/useDocumentCache";
import ProfilePicture from "../../ProfilePicture.vue";

const { getUniqueConnectedSockets, focusData } = storeToRefs(useSocket());
const { lgAndUp } = useDisplay();

const { getActivePanel, loadingItems, filteredItems } = storeToRefs(useSheetManager());
const { setPanel } = useSheetManager();

const documents = storeToRefs(useDocumentCache());

const displayAccounts = (panel: Panel) => {
  return getUniqueConnectedSockets.value.filter(({ socketId }) => {
    const accountPanelName = focusData.value[socketId]?.panelName;
    return panel.panelName === accountPanelName;
  });
};

const hoveredPanel = ref<PanelName | null>(null);

const panelTitle = computed(() => {
  const title = getActivePanel.value.title.plural;
  if (lgAndUp.value || title.split(" ").length <= 1) {
    return title;
  } else {
    return title.split(" ")[1];
  }
});

const highlightItem = (panel: Panel) => {
  return panel.panelName === hoveredPanel.value || panel.panelName === getActivePanel.value.panelName;
};
</script>

<style scoped>
.panel-dropdown-item:hover {
  background: rgba(0, 0, 0, 0.1);
}

.panel-dropdown-item {
  font-size: 1.25rem;
  font-weight: 700;
  text-transform: capitalize;
  cursor: pointer;
}
</style>