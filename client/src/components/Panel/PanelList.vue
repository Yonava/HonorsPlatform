<template>
  <div>
    <div v-if="!loadingItems">
      <div
        style="position: relative; width: 100%"
        class="d-flex flex-column align-center"
      >
        <div
          v-for="item in incrementallyRenderedItems"
          :key="item"
          @click="setSelectedItem(item)"
          style="width: 100%"
        >
          <component
            :is="panel.components.list"
            :item="item"
          />
        </div>
      </div>
      <v-sheet
        v-if="filteredItems.length === 0"
        class="mt-2"
        style="width: 90%; border-radius: 10px; margin: 0 auto;"
        :color="`${panel.color}-darken-1`"
        elevation="3"
      >
        <div
          style="text-align: center;"
          class="d-flex justify-center flex-column pa-4"
        >
          <h3>
            <v-icon class="mr-1 mb-1">
              {{ panel.icon }}
            </v-icon>
            no {{ panel.title.plural.toLowerCase() }} in system
          </h3>
          <span v-if="searchFilter">
            try clearing "{{ searchFilter }}" from the search filter
            to view all {{ panel.title.plural.toLowerCase() }}
          </span>
        </div>
      </v-sheet>
    </div>
    <div v-else>
      <div class="d-flex justify-center">
        <v-progress-circular
          :color="`${panel.color}-darken-4`"
          size="32"
          indeterminate
          class="mt-12"
        ></v-progress-circular>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDocumentCache } from '../../store/useDocumentCache'
import { useSheetManager } from '../../store/useSheetManager'
import { useIncrementalRender } from '../../useIncrementalRender'
import { SheetItem } from '../../SheetTypes'
import { storeToRefs } from 'pinia'

const { addSelectedItem, getSelectedItems, setSelectedItems } = useDocumentCache()

const sheetManager = useSheetManager()
const { filteredItems, loadingItems, panel, searchFilter } = storeToRefs(sheetManager)

const { incrementallyRenderedItems } = useIncrementalRender(filteredItems)

const setSelectedItem = (item: SheetItem) => {
  const focusedItem = useSheetManager().focusedItem
  const selectedItems = getSelectedItems()
  const focusedItemIndex = selectedItems.findIndex(i => i.sysId === focusedItem?.sysId)
  const selectedItemIndex = selectedItems.findIndex(i => i.sysId === item.sysId)

  // if the item is already selected, focus it
  if (selectedItemIndex !== -1) {
    useSheetManager().focusedItem = item
    return
  }

  if (focusedItemIndex === -1) {
    addSelectedItem({ item })
  } else {
    const newSelectedItems = [...selectedItems]
    newSelectedItems[focusedItemIndex] = item
    setSelectedItems({
      items: newSelectedItems
    })
    useSheetManager().focusedItem = item
  }
}
</script>