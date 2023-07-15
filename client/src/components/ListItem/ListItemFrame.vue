<template>
  <div>
    <div
      v-if="styled"
      @dragstart="dragStart"
      @dragend="useSheetManager().listItemBeingDragged = null"
      :draggable="lgAndUp && !isSelected(item)"
      :class="[
        'item-card',
        'pa-4',
        isSelected(item) ? 'selected-item-card' : ''
      ]"
    >
      <slot></slot>
    </div>
    <div
      v-else
      @dragstart="dragStart"
      @dragend="useSheetManager().listItemBeingDragged = null"
      :draggable="lgAndUp && !isSelected(item)"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SheetItem } from '../../SheetTypes'
import { useSheetManager } from '../../store/useSheetManager'
import { useDocumentCache } from '../../store/useDocumentCache'
import { useDisplay } from 'vuetify'

const { lgAndUp } = useDisplay()

const { getSelectedItems } = useDocumentCache()

const props = defineProps<{
  item: SheetItem,
  styled?: boolean
}>()

const isSelected = (item: SheetItem) => {
  const selectedItems = getSelectedItems()
  if (!selectedItems) return false
  return selectedItems.map((item) => item.sysId).includes(item.sysId)
}

const dragStart = () => {
  useSheetManager().listItemBeingDragged = props.item
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