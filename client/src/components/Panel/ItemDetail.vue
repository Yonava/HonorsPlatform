<template>
  <v-sheet
    style="height: 100%; width: 100%; overflow: auto;"
    class="d-flex flex-grow-1 flex-row align-center"
  >
    <div
      @dragenter="dragState = true"
      @dragleave="dragState = false"
      @dragover="dragOver"
      @drop="drop"
      :style="{
        height: '100%',
        width: '100%',
        position: 'absolute',
        zIndex: '99',
        pointerEvents: allowPointerEvents ? 'all' : 'none'
      }"
    ></div>
    <v-sheet
      v-for="item in getSelectedItems()"
      :key="item.sysId"
      :style="{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        background: isFocused(item) ? '' : 'rgba(0,0,0,0.05)',
      }"
    >
      <component
        :is="getActivePanel.components.detail"
        :item="item"
      />
    </v-sheet>
    <v-sheet
      v-if="dragState"
      :color="getActivePanel.color"
      :style="{
        width: '100%',
        height: '100%',
        opacity: '0.75'
      }"
      class="d-flex justify-center align-center"
    >
      <v-icon size="20rem">
        {{ getActivePanel.icon }}
      </v-icon>
    </v-sheet>
    <div
      v-if="!getSelectedItems().length && !dragState"
      class="justify-center d-flex"
      style="width: 100%; height: 100%;"
    >
      <v-icon style="font-size: 35vw; opacity: 0.1;">
        {{ getActivePanel.icon }}
      </v-icon>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { useSheetManager } from '../../store/useSheetManager';
import { useDocumentCache } from '../../store/useDocumentCache';
import { SheetItem } from '../../SheetTypes';
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia'

const dragState = ref(false)

const sheetManager = useSheetManager()
const { getActivePanel } = storeToRefs(sheetManager)

const { getSelectedItems, addSelectedItem } = useDocumentCache()

const drop = (e: DragEvent) => {
  dragState.value = false
  const item = useSheetManager().listItemBeingDragged
  if (item) {
    addSelectedItem({ item })
  }
}

const dragOver = (e: DragEvent) => {
  e.preventDefault()
}

const isFocused = (item: SheetItem) => {
  const focusedItem = useSheetManager().focusedItem
  return focusedItem && focusedItem.sysId === item.sysId
}

const allowPointerEvents = computed(() => {
  return useSheetManager().listItemBeingDragged
})
</script>