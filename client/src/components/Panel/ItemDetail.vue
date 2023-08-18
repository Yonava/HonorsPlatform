<template>
  <v-sheet
    style="height: 100%; width: 100%; overflow: auto; position: relative;"
    class="d-flex flex-grow-1 flex-row align-center"
  >
    <div
      v-if="movementObject"
      @dragenter="dragStateMove = true"
      @dragleave="dragStateMove = false"
      @dragover="dragOver"
      @drop="dropMove"
      :style="{
        top: '0',
        width: '100%',
        height: '50px',
        position: 'absolute',
        zIndex: '1000',
        pointerEvents: allowPointerEvents ? 'all' : 'none',
        borderRadius: '0 0 10px 10px',
        gap: '10px',
      }"
    ></div>
    <v-sheet
      v-if="movementObject"
      :color="movementObject.to.color"
      :style="{
        transition: 'all 0.3s ease',
        top: '0',
        width: '100%',
        height: '50px',
        position: 'absolute',
        zIndex: '999',
        borderRadius: '0 0 10px 10px',
        gap: '10px',
        overflow: 'hidden',
        transform: moveWidgetActive ? 'translateY(0)' : 'translateY(-100%)',
      }"
      class="d-flex align-center justify-center"
    >
      <v-sheet
        :style="{
          left: '0',
          transition: 'all 0.3s ease',
          transitionDelay: dragStateMove ? '0' : '0.3s',
          width: dragStateMove || movingItem ? '100%' : '0',
          height: '100%',
          zIndex: '999',
          position: 'absolute',
        }"
        color="green"
        class="d-flex align-center justify-center"
      >
        <v-icon
          v-if="!movingItem"
          :style="{
            transition: 'all 0.3s ease',
            transitionDelay: dragStateMove ? '0.3s' : '0',
            opacity: dragStateMove ? '1' : '0',
            transform: dragStateMove ? 'translateX(0)' : 'translateX(-10px)',
          }"
          size="x-large"
        >
          mdi-arrow-right
        </v-icon>
        <v-progress-circular
          v-else
          indeterminate
        ></v-progress-circular>
      </v-sheet>
      <div style="color: white">
        <v-icon
          size="x-large"
          class="mb-1"
        >
          {{ movementObject.to.icon }}
        </v-icon>
        <b style="font-size: 1.5rem;">
          Drag To {{ movementObject.to.title.plural }}
        </b>
      </div>
    </v-sheet>
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
      v-for="item in useDocumentCache()[getActivePanel.sheetRange].selected"
      :key="item.sysId"
      @click="setFocusedItem(item.sysId)"
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
      v-if="!useDocumentCache()[getActivePanel.sheetRange].selected.length && !dragState"
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
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMoveItem } from '../../MoveItems'

const dragState = ref(false)
const dragStateMove = ref(false)

const sheetManager = useSheetManager()
const { getActivePanel, listItemBeingDragged, focusedItemSysId } = storeToRefs(sheetManager)
const { setFocusedItem } = sheetManager

const { addSelectedItem } = useDocumentCache()

const moveWidgetActive = computed(() => {
  return listItemBeingDragged.value || movingItem.value
})

const { moveItem, movingItem, movementObject } = useMoveItem()

const drop = (e: DragEvent) => {
  dragState.value = false
  const item = listItemBeingDragged.value
  if (item) {
    addSelectedItem({ item })
  }
}

const dropMove = (e: DragEvent) => {
  dragStateMove.value = false
  const item = listItemBeingDragged.value
  if (item) {
    moveItem(item)
  }
}

const dragOver = (e: DragEvent) => {
  e.preventDefault()
}

const isFocused = (item: SheetItem) => {
  return focusedItemSysId.value === item.sysId
}

const allowPointerEvents = computed(() => {
  return listItemBeingDragged.value
})
</script>

<style scoped>
  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.3s ease;
  }
  .slide-enter,
  .slide-leave-to {
    transform: translateX(10px);
    opacity: 0;
  }
</style>