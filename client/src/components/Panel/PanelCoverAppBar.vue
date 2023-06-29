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
    <h1>Suggestions</h1>
    <p
      v-if="!getPanelCover.loading"
      class="ml-2"
    >({{ getListOfFlaggedItems.length }})</p>
    <p
      v-else
      class="ml-2"
    >
      (computing)
    </p>
    <div>
      <input
        v-model="getPanelCover.filter"
        type="text"
        placeholder="Search suggestions"
        class="ml-5 filter-input"
      >
    </div>
    <v-spacer></v-spacer>
    <div
      v-if="!getPanelCover.loadingSuggestions"
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
        selected items ({{ selectedItems.length }})
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
import type { SheetItem } from '../../SheetTypes'
import { warn } from '../../Warn'

const { setPanelCover, open, close } = useDialog();
const { getPanelCover, getListOfFlaggedItems } = storeToRefs(useDialog());
const { getPanelListData, deleteItem } = useDocumentCache()
const { getActivePanel } = storeToRefs(useSheetManager());

const selectedItems = computed(() => {
  const selected = []
  const selectedSysIds = getPanelCover.value.selectedForDelete
  selectedSysIds.forEach((sysId) => {
    const itemCorrespondingToSysId = getPanelListData().find((itemInPanel) => {
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

const deleteItems = async (items: SheetItem[]) => {
  console.log(items)
  await warn(null, null, `You are about to take a serious action that will permanently delete ${items.length} item${items.length > 1 ? 's' : ''}!`.toUpperCase())
  await new Promise((resolve) => setTimeout(resolve, 500))
  await warn(null, null, `are you sure???? permanently delete ${items.length} item${items.length > 1 ? 's' : ''}????`.toUpperCase())
  await new Promise((resolve) => setTimeout(resolve, 500))
  await useSyncState().waitUntilSynced()
  open({
    body: {
      title: "Your Wish is My Command!",
      description: "Hang tight as we process your request, this may take a moment."
    }
  })
  for (const item of items) {
    await deleteItem({
      item,
      showWarning: false,
      concurrent: true
    })
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
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
  width: 450px;
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