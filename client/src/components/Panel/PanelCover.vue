<template>
  <div>
    <div v-if="incrementallyRenderedItems.length > 0">
      <v-sheet
        v-for="{ item, rationale, status } in incrementallyRenderedItems"
        :key="item"
        @click="setSelectedItem(item)"
        :color="getPanelCover.selectedForDelete.includes(item.sysId) ? 'red-lighten-4' : ''"
         :class="[
          'item-card',
          'px-4 pb-4',
          isSelected(item) ? 'selected-item-card' : '',
        ]"
      >
        <div
          class="pa-5 d-flex flex-row align-center"
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
            High Five!
          </h3>
          <p>
            All issues resolved 🤙
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
            {{ status === 'danger' ? 'recommend' : 'would consider' }} deleting
          </h3>
          <p>
            {{ rationale }}
          </p>
        </v-sheet>
      </v-sheet>
    </div>
    <div
      v-else-if="!getPanelCover.filter && getPanelCover.show"
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
import { watchEffect, computed } from "vue";
import { useDialog } from "../../store/useDialog";
import { useSheetManager } from "../../store/useSheetManager";
import { storeToRefs } from "pinia";
import { getSuggestedDeletions } from "../../DeleteSuggestions";
import { useIncrementalRender } from "../../useIncrementalRender";
import { filterItems } from '../../FilterObjects'
import { setSelectedItem } from "./SetSelectedItem";
import { useDocumentCache } from "../../store/useDocumentCache";

const { getPanelCover } = storeToRefs(useDialog());
const { getActivePanel } = storeToRefs(useSheetManager());

const displayItems = computed(() => {
  const items = filterItems(getPanelCover.value.deletionItems.map(data => ({
    title: data.item[getActivePanel.value.properties.title],
    sysId: data.item.sysId,
    rationale: data.rationale,
  })), getPanelCover.value.filter)
  return items.map(item => {
    return getPanelCover.value.deletionItems.find(data => data.item.sysId === item.sysId)
  })
})

const { incrementallyRenderedItems } = useIncrementalRender(displayItems);

watchEffect(async () => {
  if (getPanelCover.value.show) {
    getPanelCover.value.deletionItems = await getSuggestedDeletions(getActivePanel.value);
  }
});

const isSelected = (item: any) => {
  const selectedItems = useDocumentCache().getSelectedItems()
  if (!selectedItems) return false
  return selectedItems.map((item) => item.sysId).includes(item.sysId)
}
</script>

<style scoped>
.item-card {
  width: 100%;
  background: rgba(255,255,255, 0.5);
  cursor: pointer;
  transition: 350ms;
  overflow: auto;
}

.selected-item-card {
  background: rgba(255,255,255, 1);
}

.item-card:hover {
  background: rgba(255,255,255, 1);
}
</style>