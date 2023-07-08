<template>
  <div>
    <div class="d-flex flex-row align-center mb-2">
      <h2>
        {{ text.title }}
      </h2>
      <v-spacer></v-spacer>
      <v-btn
        @click="addEmbeddedItem"
        size="small"
        color="green"
      >
        <v-icon class="mr-1">mdi-plus</v-icon>
        {{ text.add }}
      </v-btn>
    </div>
    <div
      v-if="loadingItems"
      class="d-flex flex-row justify-center"
    >
      <v-progress-circular
        :color="getActiveEmbeddedPanel.color"
        indeterminate
        class="ma-4"
      ></v-progress-circular>
    </div>
    <div
      v-else-if="displayedItems.length === 0"
      style="font-weight: 200; color: red; font-size: 25px"
    >
      {{ text.noItemsToDisplay }}
    </div>
    <div
      v-else
      style="max-height: 300px; overflow: auto"
    >
      <component
        :is="getActivePanel.embedded.list"
        @selected="item => setSelectedEmbeddedItem(item)"
        @delete="item => deleteEmbeddedItem(item)"
        :items="displayedItems"
      />
    </div>
    <component
      v-if="getSelectedItem(getActiveEmbeddedPanel)"
      :is="getActivePanel.embedded.detail"
    />
  </div>
</template>

<script setup lang="ts">
import { useUpdateItem } from '../../../TrackItemForUpdate'
import { computed, toRefs } from 'vue'
import { SheetItem } from '../../../SheetTypes'
import { useSheetManager } from '../../../store/useSheetManager'
import { useDocumentCache } from '../../../store/useDocumentCache'
import { storeToRefs } from 'pinia'

const sheetManager = useSheetManager()
const { getActivePanel, getActiveEmbeddedPanel } = sheetManager
const { loadingItems } = storeToRefs(sheetManager)

const documents = useDocumentCache()
const { deleteItem, setSelectedItem, getSelectedItem, addItem, updateItem } = documents

const { filterBy, text } = getActivePanel.embedded

const { list: items, selected } = toRefs(documents[getActiveEmbeddedPanel.sheetRange])
useUpdateItem(selected, getActiveEmbeddedPanel)

const displayedItems = computed(() => {
  if (!getSelectedItem()[filterBy.outer]) return []
  return items.value.filter(e => e[filterBy.inner] === getSelectedItem()[filterBy.outer])
})

const addEmbeddedItem = async () => {
  // edge case for when parent panel is not yet saved to the sheet
  const parentItem = getSelectedItem()!
  if (!parentItem.row) {
    updateItem()
  }

  await addItem({
    panel: getActiveEmbeddedPanel,
    pin: false,
    columns: [
      getSelectedItem()[filterBy.outer],
    ],
  })
}

const setSelectedEmbeddedItem = (item: SheetItem) => {
  setSelectedItem({
    item,
    panel: getActiveEmbeddedPanel,
  })
}

const deleteEmbeddedItem = async (item: SheetItem) => {
  await deleteItem({
    item,
    panel: getActiveEmbeddedPanel,
  })
}
</script>