<template>
  <div>
    <div v-if="!loadingSuggestions && incrementallyRenderedItems.length > 0">
      <v-sheet
        v-for="{ item, rationale, status } in incrementallyRenderedItems"
        :key="item"
        @click="setSelectedItem({ item })"
        :color="selectedForDeletion.includes(item.sysId) ? 'red-lighten-4' : ''"
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
              v-if="!selectedForDeletion.includes(item.sysId)"
              @click.stop="selectedForDeletion.push(item.sysId)"
              size="x-large"
            >
              mdi-delete-empty-outline
            </v-icon>
            <v-icon
              v-else
              @click.stop="selectedForDeletion = selectedForDeletion.filter(id => id !== item.sysId)"
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
          :color="status === 'danger' ? 'red' : 'yellow'"
          elevation="2"
          class="pa-4"
          style="border-radius: 10px;"
        >
          <h3 style="text-transform: capitalize">We {{ status === 'danger' ? 'encourage' : 'would consider' }} deleting this {{ getActivePanel.title.singular }} because</h3>
          <p>{{ rationale }}</p>
        </v-sheet>
      </v-sheet>
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
    <div
      v-else-if="getPanelCover.show"
      class="pa-4 d-flex justify-center"
    >
      <v-sheet
        :color="getActivePanel.color + '-darken-2'"
        class="pa-5 mt-2"
        elevation="3"
        style="border-radius: 10px; max-width: 500px"
      >
        <h1 class="text-center">Looking Good 💁‍♂️</h1>
        <p class="text-center">
          We would not suggest deleting any {{ getActivePanel.title.plural.toLowerCase() }} at this time.
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
import { getSuggestedDeletions, DeletionOutput } from "../../DeleteSuggestions";
import { useSyncState } from "../../store/useSyncState";
import { useIncrementalRender } from "../../useIncrementalRender";
import { useDisplay } from "vuetify";
import { filterItems } from '../../FilterObjects'
import { SheetItem } from '../../SheetTypes'

const { getPanelCover } = storeToRefs(useDialog());
const { getActivePanel } = storeToRefs(useSheetManager());
const { getSelectedItem, setSelectedItem } = useDocumentCache();
const { processing } = storeToRefs(useSyncState());

const deletionData = ref<DeletionOutput<SheetItem>[]>([]);
const selectedForDeletion = ref([]);
const loadingSuggestions = ref(false);

const { xs } = useDisplay();

const displayItems = computed(() => {
  const items = filterItems<SheetItem>(deletionData.value.map(data => data.item), getPanelCover.value.filter)
  return items.map(item => {
    const { rationale, status } = deletionData.value.find(data => data.item.sysId === item.sysId)
    return { item, rationale, status }
  })
})

const { incrementallyRenderedItems } = useIncrementalRender(displayItems);

watchEffect(async () => {
  deletionData.value = [];
  if (getPanelCover.value.show) {
    loadingSuggestions.value = true;
    deletionData.value = await getSuggestedDeletions(getActivePanel.value);
    loadingSuggestions.value = false;
  }
});

watchEffect(async () => {
  if (getPanelCover.value.show && !processing.value) {
    deletionData.value = await getSuggestedDeletions(getActivePanel.value);
  }
});

watch(() => getSelectedItem(), async (newItem) => {
  if (newItem && getPanelCover.value.show) {
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