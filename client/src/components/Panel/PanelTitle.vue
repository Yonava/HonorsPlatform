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
          <p
            :style="{
              opacity: loadingItems ? 0 : 1,
              width: '35px'
            }"
            class="ml-2"
          >
            ({{ filteredItems.length }})
          </p>
        </div>
      </template>

      <v-list @mouseleave="hoveredPanel = ''">
        <v-sheet
          v-for="panel in panels"
          @click="setPanel(panel.panelName)"
          @mouseover="hoveredPanel = panel.panelName"
          :key="panel.title.singular"
          :color="highlightItem(panel) ? panel.color + '-darken-1' : 'white'"
          class="py-2 px-4 panel-dropdown-item"
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
          </span>
        </v-sheet>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useSheetManager } from "../../store/useSheetManager";
import { useDisplay } from "vuetify";
import { panels, Panel } from "../../Panels";

const { lgAndUp } = useDisplay();
const { getActivePanel, loadingItems, filteredItems } = storeToRefs(useSheetManager());
const { setPanel } = useSheetManager();

const hoveredPanel = ref("");

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