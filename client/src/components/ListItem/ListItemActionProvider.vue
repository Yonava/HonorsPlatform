<template>
  <div
    @dragstart="dragStart"
    @dragend="useSheetManager().listItemBeingDragged = null"
    @mouseover="setHovered(true)"
    @mouseleave="setHovered(false)"
    :draggable="mdAndUp && !isSelected"
    :class="[
      'item-card',
      'pa-4',
      isSelected ? 'selected-item-card' : '',
      'd-flex',
      'flex-row'
    ]"
    style="height: 100%;"
  >

    <SidebarActions
      :show="showingSidebarActions"
      :item="props.item"
    />

    <v-spacer></v-spacer>

    <div
      class="d-flex align-center"
      :style="{
        transition: '300ms ease-in-out',
        width: showingSidebarActions ? 'calc(100% - 35px)' : '100%',
        position: 'relative'
      }"
    >
      <div
        class="d-flex flex-column"
        style="position: relative; height: 60px; transform: translateY(-5px)"
      >

        <div
          v-for="(account, i) in accounts"
          :key="account.id"
          class="mr-2"
          :style="{
            transform: `translateY(${i * -20}px)`,
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            border: '1px solid white',
            cursor: 'pointer',
          }"
        >
          <img
            :src="account.picture"
            :style="{
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: '50%',
              objectFit: 'cover',
            }"
          />
        </div>

      </div>

      <div
        :style="{
          width: accounts.length > 0 ? 'calc(100% - 40px)' : '100%',
        }"
      >
        <slot></slot>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { storeToRefs } from 'pinia'
import { useSheetManager } from '@store/useSheetManager'
import { useDocumentCache } from '@store/useDocumentCache'
import { useSocket } from '@store/useSocket'
import type { SheetItem } from '@apptypes/sheetItems'
import SidebarActions from './SidebarActions.vue'

const props = defineProps<{
  item: SheetItem
}>()

const { mdAndUp } = useDisplay()

const { getSelectedItems } = useDocumentCache()
const { focusData, getUniqueConnectedSockets } = storeToRefs(useSocket())

const accounts = computed(() => {
  return getUniqueConnectedSockets.value.filter(({ socketId }) => {
    const sysIdAccountIsFocusedOn = focusData.value[socketId]?.sysId;
    return sysIdAccountIsFocusedOn === props.item.sysId
  });
})

const isPinned = computed(() => {
  return !!useSheetManager().getPinnedItem(props.item)
})

const showingSidebarActions = computed(() => {
  return listItemHovered.value || isPinned.value
})

const listItemHovered = ref(false)

const isSelected = computed(() => {
  const selectedItems = getSelectedItems()
  if (!selectedItems) return false
  return selectedItems.map((item) => item.sysId).includes(props.item.sysId)
})

const dragStart = () => {
  useSheetManager().listItemBeingDragged = props.item
}

const setHovered = (v: boolean) => {
  if (!mdAndUp.value) return
  listItemHovered.value = v
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