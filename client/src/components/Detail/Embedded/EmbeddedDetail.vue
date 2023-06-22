<template>
  <div>
    <LockArea
      v-if="!getSelectedItem()[filterBy.outer]"
      :title="text.lock.title"
      :condition="text.lock.condition"
    />
    <div v-else>
      <div class="d-flex flex-row align-center mb-2">
        <h2>
          {{ text.title }}
        </h2>
        <v-spacer></v-spacer>
        <v-btn
          @click="addNewItem"
          size="small"
          color="green"
        >
          <v-icon class="mr-1">mdi-plus</v-icon>
          {{ text.add }}
        </v-btn>
      </div>
      <div
        v-if="loading"
        class="d-flex flex-row justify-center"
      >
        <v-progress-circular
          indeterminate
          class="mt-3"
          :color="`${panel.color}-darken-2`"
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
          @selected="item => setSelectedItem(item, panel)"
          @delete="item => deleteItem(item, panel)"
          :items="displayedItems"
        />
      </div>
      <component :is="getActivePanel.embedded.detail" />
    </div>
  </div>

</template>

<script setup lang="ts">
import LockArea from './LockArea.vue'
import { ref, computed, watch, toRefs, onMounted } from 'vue'
import { Module } from '../../../SheetTypes'
import { panels } from '../../../Panels'
import { useSheetManager } from '../../../store/useSheetManager'
import { useDocumentCache } from '../../../store/useDocumentCache'

const { newSysId, getActivePanel } = useSheetManager()
const documents = useDocumentCache()
const { refreshCache, deleteItem, setSelectedItem, getSelectedItem, addItem } = documents
const { filterBy, text } = getActivePanel.embedded
const panel = panels[getActivePanel.embedded.panel]

const { list: items } = toRefs(documents[panel.sheetRange])

const loading = ref(true)
onMounted(async () => {
  const cachedModules = documents[panel.sheetRange].list
  if (cachedModules.length === 0) {
    await refreshCache(panel)
  }
  loading.value = false
})

const displayedItems = computed(() => {
  if (!getSelectedItem()[filterBy.outer]) return []
  return items.value.filter(e => e[filterBy.inner] === getSelectedItem()[filterBy.outer])
})

async function addNewItem() {
  await addItem(panel, false, false, [
    newSysId(),
    getSelectedItem()[filterBy.outer],
  ])
}
</script>