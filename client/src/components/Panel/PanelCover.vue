<template>
  <div>
    <div v-if="!loadingSuggestions && incrementallyRenderedItems.length > 0">
      <div
        v-for="{ item, rationale, status } in incrementallyRenderedItems"
        :key="item"
        @click="setSelectedItem({ item })"
        :class="[
          'item-card',
          'px-4 pb-4',
          isSelected(item) ? 'selected-item-card' : ''
        ]"
      >
        <div class="pa-5">
          <component
            :is="getActivePanel.components.list"
            :item="item"
          />
        </div>
        <v-sheet
          :color="status === 'danger' ? 'red' : 'yellow'"
          elevation="2"
          class="pa-4"
          style="border-radius: 10px;"
        >
          <h3 style="text-transform: capitalize">We {{ status === 'danger' ? 'encourage' : 'would consider' }} deleting this {{ getActivePanel.title.singular }} because</h3>
          <p>{{ rationale }}</p>
        </v-sheet>
      </div>
    </div>
    <div
      v-else-if="loadingSuggestions"
      class="text-center mt-12"
    >
      <v-progress-circular
        :color="getActivePanel.color + '-darken-2'"
        indeterminate
      ></v-progress-circular>
    </div>
    <div v-else-if="getPanelCover">
      <div class="pa-5">
        <h1 class="text-center">Looking Good!</h1>
        <p class="text-center">
          We would not suggest deleting any {{ getActivePanel.title.plural.toLowerCase() }} at this time.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watchEffect, ref, watch } from "vue";
import { useDialog } from "../../store/useDialog";
import { useSheetManager } from "../../store/useSheetManager";
import { useDocumentCache } from "../../store/useDocumentCache";
import { storeToRefs } from "pinia";
import { getSuggestedDeletions } from "../../DeleteSuggestions";
import { useSyncState } from "../../store/useSyncState";
import { useIncrementalRender } from "../../useIncrementalRender";

const { getPanelCover } = storeToRefs(useDialog());
const { getActivePanel } = storeToRefs(useSheetManager());
const { getSelectedItem, setSelectedItem } = useDocumentCache();
const { processing } = storeToRefs(useSyncState());

const deletionData = ref([]);
const loadingSuggestions = ref(false);

const { incrementallyRenderedItems } = useIncrementalRender(deletionData);

watchEffect(async () => {
  deletionData.value = [];
  if (getPanelCover.value) {
    loadingSuggestions.value = true;
    deletionData.value = await getSuggestedDeletions(getActivePanel.value);
    loadingSuggestions.value = false;
  }
});

watchEffect(async () => {
  if (getPanelCover.value && !processing.value) {
    deletionData.value = await getSuggestedDeletions(getActivePanel.value);
  }
});

watch(() => getSelectedItem(), async (newItem) => {
  if (newItem && getPanelCover.value) {
    deletionData.value = await getSuggestedDeletions(getActivePanel.value);
  }
}, { deep: true });

watch(getActivePanel, async (newPanel) => {
  deletionData.value = [];
  deletionData.value = await getSuggestedDeletions(newPanel);
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
  border-bottom: 1px solid rgba(111, 111, 111, 0.21);
}

.selected-item-card {
  background: rgba(255,255,255, 1);
}

.item-card:hover {
  background: rgba(255,255,255, 1);
}
</style>