<template>
  <div>
    <div class="d-flex flex-row align-center mb-2">
      <h2>
        {{ text.title }}
      </h2>
      <v-spacer></v-spacer>
      <v-btn
        @click="addEmbeddedItem"
        :disabled="readOnlyMode"
        size="small"
        color="green"
      >
        <v-icon class="mr-1">
          mdi-plus
        </v-icon>
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
        @selected="setFocusedEmbeddedItem($event)"
        @delete="deleteEmbeddedItem($event)"
        :items="displayedItems"
      />
    </div>
    <component
      v-if="focusedEmbeddedItem && item.sysId === focusedEmbeddedItem.studentSysId"
      :is="getActivePanel.embedded.detail"
      :broadcastThroughSocket="broadcastThroughSocket"
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
const { getActivePanel, getActiveEmbeddedPanel, setFocusedEmbeddedItem } = sheetManager
const { loadingItems, focusedEmbeddedItem, readOnlyMode } = storeToRefs(sheetManager)

const documents = useDocumentCache()
const { deleteItem, addItem, updateItem } = documents

const { filterBy, text } = getActivePanel.embedded

const props = defineProps<{
  item: SheetItem
}>()

const { list: items } = toRefs(documents[getActiveEmbeddedPanel.sheetRange])
const { broadcastThroughSocket } = useUpdateItem(focusedEmbeddedItem, getActiveEmbeddedPanel.panelName)

const displayedItems = computed(() => {
  if (!props.item[filterBy.outer]) {
    return []
  }
  return items.value.filter(e => e[filterBy.inner] === props.item[filterBy.outer])
})

const addEmbeddedItem = async () => {
  // edge case for when parent panel is not yet saved to the sheet
  if (!props.item.row) {
    updateItem({
      item: props.item
    })
  }

  const createdItem = await addItem({
    panelName: getActiveEmbeddedPanel.panelName,
    columns: [
      props.item[filterBy.outer],
    ],
  })

  setFocusedEmbeddedItem(createdItem)
}

const deleteEmbeddedItem = async (item: SheetItem) => {
  await deleteItem({
    item,
    panelName: getActiveEmbeddedPanel.panelName,
  })
}
</script>