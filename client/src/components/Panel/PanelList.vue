<template>
  <div style="width: 100%">
    <div v-if="!loadingItems">
      <div
        style="position: relative; width: 100%"
        class="d-flex flex-column align-center"
      >
        <div
          v-for="item in filteredItems.slice(0, itemsToDisplay)"
          :key="item"
          @click="setSelectedItem({ item })"
          :class="[
            'item-card',
            'pa-3',
            isSelected(item) ? 'selected-item-card' : ''
          ]"
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
import {
  ref,
  computed,
  watch
} from 'vue'

import { useDocumentCache } from '../../store/useDocumentCache'
import { useSheetManager } from '../../store/useSheetManager'
import { storeToRefs } from 'pinia'

const { setSelectedItem, getSelectedItem } = useDocumentCache()

const sheetManager = useSheetManager()
const { filteredItems, loadingItems, panel, searchFilter } = storeToRefs(sheetManager)

const itemsToDisplay = ref(filteredItems.value.length)

let updateInterval;
watch(filteredItems, () => {
  if (itemsToDisplay.value !== filteredItems.value.length) {
    clearInterval(updateInterval)
    updateInterval = setInterval(() => {
      if (itemsToDisplay.value === filteredItems.value.length) {
        clearInterval(updateInterval)
        return
      }
      else if (itemsToDisplay.value > filteredItems.value.length) itemsToDisplay.value = filteredItems.value.length
      else if (itemsToDisplay.value < filteredItems.value.length) itemsToDisplay.value = itemsToDisplay.value + 1
    }, 10)
  }
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