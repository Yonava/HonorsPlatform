<template>
  <v-sheet
    @dragenter="dragState = true"
    @dragleave="dragState = false"
    @dragover="dragOver"
    @drop="drop"
    :color="dragState ? `${getActivePanel.color}-lighten-4` : ''"
    style="height: 100%; width: 100%; overflow: auto;"
    class="d-flex flex-grow-1 flex-row align-center"
  >
    <div
      v-for="item in getSelectedItems()"
      :key="item.sysId"
      :style="{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        border: isFocused(item) ? '1px solid black' : ''
      }"
    >
      <component
        :is="getActivePanel.components.detail"
        :item="item"
      />
    </div>
    <div
      v-if="!getSelectedItems().length"
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
import { ref } from 'vue';

const dragState = ref(false)

const sheetManager = useSheetManager()
const { getActivePanel } = sheetManager

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
</script>