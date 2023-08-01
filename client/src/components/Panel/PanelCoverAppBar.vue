<template>
  <v-app-bar
    :color="`${getActivePanel.color}-darken-2`"
    class="px-5"
  >
    <v-icon
      @click="setPanelCover('close')"
      icon="mdi-chevron-left"
      size="x-large"
      class="mr-2"
    ></v-icon>
    <h1>
      {{ mdAndDown ? 'Suggested' : 'Suggestions' }}
    </h1>
    <p
      v-if="!getPanelCover.loading"
      class="ml-2"
    >({{ getListOfFlaggedItems.length }})</p>
    <div v-if="!mdAndDown">
      <input
        v-model="getPanelCover.filter"
        type="text"
        placeholder="Search suggestions"
        class="ml-5 filter-input"
      >
    </div>
    <v-spacer></v-spacer>
    <v-btn
      v-if="mdAndDown"
      @click="deleteItems(selectedItems)"
      :disabled="selectedItems.length === 0"
      color="red"
      variant="elevated"
      rounded
    >
      <v-icon>
        mdi-delete
      </v-icon>
      {{ selectedItems.length }}
    </v-btn>
    <div
      v-if="!getPanelCover.loadingSuggestions && !mdAndDown"
      class="d-flex flex-row align-center"
    >
      <h4>
        Delete All:
      </h4>
      <v-btn
        @click="deleteItems(selectedItems)"
        :disabled="selectedItems.length === 0"
        class="ml-2"
        variant="outlined"
      >
        selected ({{ selectedItems.length }})
      </v-btn>
      <v-btn
        @click="deleteItems(dangerStatusItems)"
        :disabled="dangerStatusItems.length === 0"
        class="ml-2"
        variant="elevated"
        color="red"
      >Recommended ({{ dangerStatusItems.length }})</v-btn>
      <v-btn
        @click="deleteItems(warnStatusItems)"
        :disabled="warnStatusItems.length === 0"
        class="ml-2"
        variant="elevated"
        color="yellow"
      >Considerations ({{ warnStatusItems.length }})</v-btn>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDialog } from "../../store/useDialog";
import { useSheetManager } from "../../store/useSheetManager";
import { storeToRefs } from "pinia";
import { useDocumentCache } from '../../store/useDocumentCache';
import { useSyncState } from '../../store/useSyncState'
import { useAuth } from '../../store/useAuth';
import type { SheetItem } from '../../SheetTypes'
import { headerRowMemo, replaceRange } from '../../SheetsAPI';
import { warn } from '../../Warn'

import { useDisplay } from 'vuetify'

const { setPanelCover, open, close } = useDialog();
const { getPanelCover, getListOfFlaggedItems } = storeToRefs(useDialog());
const { getItems, forceConnectedClientsToRefresh } = useDocumentCache()
const { getActivePanel } = storeToRefs(useSheetManager());

const { mdAndDown } = useDisplay()

const selectedItems = computed(() => {
  const selected: SheetItem[] = []
  const selectedSysIds = getPanelCover.value.selectedForDelete
  selectedSysIds.forEach((sysId) => {
    const itemCorrespondingToSysId = getItems().find((itemInPanel) => {
      return itemInPanel.sysId === sysId
    })

    if (itemCorrespondingToSysId) {
      selected.push(itemCorrespondingToSysId)
    }
  })

  return selected
})

const warnStatusItems = computed(() => {
  return getPanelCover.value.deletionItems
    .filter(item => item.status === 'warn')
    .map(item => item.item)
})

const dangerStatusItems = computed(() => {
  return getPanelCover.value.deletionItems
    .filter(item => item.status === 'danger')
    .map(item => item.item)
})

const deleteItems = async (itemsToDelete: SheetItem[]) => {
  await warn({
    title: "Are You Sure?",
    description: `You are about to take a serious action that will permanently delete ${itemsToDelete.length} item${itemsToDelete.length > 1 ? 's' : ''}!`
  })
  await new Promise((resolve) => setTimeout(resolve, 500))
  await warn({
    title: "One Last Chance!",
    description: `are you really sure you want to permanently delete ${itemsToDelete.length} item${itemsToDelete.length > 1 ? 's' : ''}?`
  })
  await new Promise((resolve) => setTimeout(resolve, 500))
  await useSyncState().waitUntilSynced()
  open({
    body: {
      title: "Your Wish is My Command!",
    }
  })

  const allItemsOnPanel = [...useDocumentCache()[getActivePanel.value.sheetRange].list]

  // filter out all items that were selected for delete
  const newData = allItemsOnPanel.filter((item) => !itemsToDelete.some((deleteItem) => {
    return deleteItem.sysId === item.sysId
  }))

  const { sheetRange } = getActivePanel.value
  const { unmap } = getActivePanel.value.mappers
  const newSheetData = await unmap(newData)
  const headerRow = headerRowMemo[sheetRange]

  if (!headerRow) {
    open({
      body: {
        title: "Uh Oh!",
        description: "Sorry, but something went wrong. Please refresh the page and try again."
      }
    })
    throw new Error(`No header row found for sheet range ${sheetRange}`)
  }

  await replaceRange(sheetRange, [
    headerRow,
    ...newSheetData
  ])

  await forceConnectedClientsToRefresh()

  close()
}
</script>

<style scoped>
.filter-input {
  background: rgba(0, 0, 0, 0.3);
  color: rgb(240, 240, 240);
  border-radius: 50px;
  padding: 3px;
  padding-left: 15px;
  border: none;
  font-size: 1.4em;
  width: 400px;
  font-weight: 200;
  box-shadow: 2px 1px 4px rgba(0, 0, 0, 0.5);
}

.filter-input:focus {
  box-shadow: 3px 2px 9px rgba(0, 0, 0, 0.5);
  outline: none;
}

.filter-input:focus::placeholder {
  color: transparent;
}

.filter-input:hover {
  box-shadow: 3px 2px 9px rgba(0, 0, 0, 0.5);
}

.filter-input::placeholder {
  color: rgba(255, 255, 255, 0.569);
}
</style>