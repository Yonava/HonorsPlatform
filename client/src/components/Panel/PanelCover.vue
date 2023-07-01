<template>
  <div>
    <div v-if="!getPanelCover.loading && incrementallyRenderedItems.length > 0">
      <v-sheet
        v-for="{ item, rationale, status } in incrementallyRenderedItems"
        :key="item"
        @click="setSelectedItem({ item })"
        :color="getPanelCover.selectedForDelete.includes(item.sysId) ? 'red-lighten-4' : ''"
        :class="[
          'item-card',
          'px-4 pb-4',
          isSelected(item) ? 'selected-item-card' : '',
        ]"
      >
        <div
          class="pa-5 d-flex flex-row align-center"
          style="width: 100%"
        >
          <div style="width: 10%">
            <v-icon
              v-if="!getPanelCover.selectedForDelete.includes(item.sysId)"
              @click.stop="getPanelCover.selectedForDelete.push(item.sysId)"
              size="x-large"
            >
              mdi-delete-empty-outline
            </v-icon>
            <v-icon
              v-else
              @click.stop="getPanelCover.selectedForDelete = getPanelCover.selectedForDelete.filter(id => id !== item.sysId)"
              size="x-large"
              color="red"
            >
              mdi-delete
            </v-icon>
          </div>
          <div style="width: 90%">
            <component
              :is="getActivePanel.components.list"
              :item="item"
            />
          </div>
        </div>
        <v-sheet
          v-if="status === 'success'"
          color="green"
          elevation="2"
          class="pa-4"
          style="border-radius: 10px;"
        >
          <h3>
            All Good!
          </h3>
          <p>
            Every aforementioned issue has been resolved. We would like to formally retract what we said before and a sincere apology to this {{ getActivePanel.title.singular.toLowerCase() }}.
          </p>
        </v-sheet>
        <v-sheet
          v-else
          :color="status === 'danger' ? 'red' : 'yellow'"
          elevation="2"
          class="pa-4"
          style="border-radius: 10px;"
        >
          <h3 style="text-transform: capitalize">
            We {{ status === 'danger' ? 'recommend' : 'would consider' }} deleting this {{ getActivePanel.title.singular }} because
          </h3>
          <p>{{ rationale }}</p>
        </v-sheet>
      </v-sheet>
    </div>
    <div
      v-else-if="getPanelCover.loading"
      class="text-center mt-12"
    >
      <v-progress-circular
        :color="getActivePanel.color + '-darken-2'"
        indeterminate
      ></v-progress-circular>
    </div>
    <div
      v-else-if="getPanelCover.show && !getPanelCover.filter"
      class="pa-4 d-flex justify-center"
    >
      <v-sheet
        :color="getActivePanel.color + '-darken-2'"
        class="pa-5 mt-2"
        elevation="3"
        style="border-radius: 10px; width: 500px"
      >
        <h1 class="text-center">Looking Good 💁‍♂️</h1>
        <p class="text-center">
          We would not suggest deleting any {{ getActivePanel.title.plural.toLowerCase() }} at this time.
        </p>
      </v-sheet>
    </div>
    <div
      v-else-if="getPanelCover.show"
      class="pa-4 d-flex justify-center"
    >
      <v-sheet
        :color="getActivePanel.color + '-darken-2'"
        class="pa-5 mt-2"
        elevation="3"
        style="border-radius: 10px; width: 500px"
      >
        <h1 class="text-center">No Results</h1>
        <p class="text-center">
          No {{ getActivePanel.title.plural.toLowerCase() }} match your search criteria.
        </p>
      </v-sheet>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watchEffect, ref, watch, computed } from "vue";
import { useDialog } from "../../store/useDialog";
import { useSheetManager } from "../../store/useSheetManager";
import { useDocumentCache } from "../../store/useDocumentCache";
import { storeToRefs } from "pinia";
import { getSuggestedDeletions } from "../../DeleteSuggestions";
import { useSyncState } from "../../store/useSyncState";
import { useIncrementalRender } from "../../useIncrementalRender";
import { useDisplay } from "vuetify";
import { filterItems } from '../../FilterObjects'

const { getPanelCover } = storeToRefs(useDialog());
const { getActivePanel } = storeToRefs(useSheetManager());
const { getSelectedItem, setSelectedItem } = useDocumentCache();
const { processing } = storeToRefs(useSyncState());

const { xs } = useDisplay();

const displayItems = computed(() => {
  const items = filterItems(getPanelCover.value.deletionItems.map(data => ({
    // TODO: Either make filterItems more efficient or create a "primary property" for each panel
    title: Object.values(data.item)[3],
    sysId: data.item.sysId,
    rationale: data.rationale,
  })), getPanelCover.value.filter)
  return items.map(item => {
    return getPanelCover.value.deletionItems.find(data => data.item.sysId === item.sysId)
  })
})

const { incrementallyRenderedItems } = useIncrementalRender(displayItems);

// when panel cover is toggled to showing
watchEffect(async () => {
  getPanelCover.value.deletionItems = [];
  if (getPanelCover.value.show) {
    getPanelCover.value.loading = true;
    getPanelCover.value.deletionItems = await getSuggestedDeletions(getActivePanel.value);
    getPanelCover.value.loading = false;
  }
});

// reruns report when processing stops to target embedded item changes
watchEffect(async () => {
  if (getPanelCover.value.loading) return
  if (getPanelCover.value.show && !processing.value) {
    getPanelCover.value.deletionItems = await getSuggestedDeletions(getActivePanel.value);
  }
});

// reruns report when an item changes
watch(() => getSelectedItem(), async (newItem) => {
  if (getPanelCover.value.loading) return
  if (newItem && getPanelCover.value.show) {
    getPanelCover.value.deletionItems = await getSuggestedDeletions(getActivePanel.value);
  }
}, { deep: true });

// ensures the lag free closing and opening of the panel cover
watch(getActivePanel, async (newPanel) => {
  getPanelCover.value.deletionItems = [];
  getPanelCover.value.deletionItems = await getSuggestedDeletions(newPanel);
})

const isSelected = item => {
  if (!getSelectedItem()) return false
  return getSelectedItem().sysId === item.sysId
}
</script>

<style scoped>
.item-card {
  width: 100%;
  background: rgba(255,255,255, 0.5);
  cursor: pointer;
  transition: 350ms;
  overflow: auto;
  border-bottom: 1px solid rgba(111, 111, 111, 0.21);
}

.selected-item-card {
  background: rgba(255,255,255, 1);
}

.item-card:hover {
  background: rgba(255,255,255, 1);
}
</style>