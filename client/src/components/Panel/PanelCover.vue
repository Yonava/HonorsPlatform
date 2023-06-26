<template>
  <div v-if="deletionData">
    <div
      v-for="{ item, rationale, status } in incrementallyRenderedItems"
      :key="item"
      @click="setSelectedItem({ item })"
      :class="[
        'item-card',
        'pa-7',
        isSelected(item) ? 'selected-item-card' : ''
      ]"
    >
      <component
        :is="getActivePanel.components.list"
        :item="item"
      />
      <v-sheet
        :color="status === 'danger' ? 'red' : 'yellow'"
        class="mt-4 pa-2"
      >
        <h3 style="text-transform: capitalize">We {{ status === 'danger' ? 'encourage' : 'would consider' }} deleting {{ item.name ||
        'this student' }} because</h3>
        <p>{{ rationale }}</p>
      </v-sheet>
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

const { incrementallyRenderedItems } = useIncrementalRender(deletionData);

watchEffect(async () => {
  if (getPanelCover.value && !processing.value) {
    deletionData.value = await getSuggestedDeletions();
  }
});

watch(() => getSelectedItem(), async (newItem) => {
  if (newItem && getPanelCover.value) {
    deletionData.value = await getSuggestedDeletions();
  }
}, { deep: true });

const isSelected = item => {
  if (!getSelectedItem()) return false
  return getSelectedItem().sysId === item.sysId
}
</script>

<style scoped>
.item-card {
  width: 100%;
  background: rgba(255,255,255, 0.5);
  padding: 10px;
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