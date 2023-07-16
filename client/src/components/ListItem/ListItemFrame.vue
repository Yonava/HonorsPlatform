<template>
  <div style="height: 100%; position: relative">
    <div
      v-if="styled"
      @dragstart="dragStart"
      @dragend="useSheetManager().listItemBeingDragged = null"
      @mouseover="setHovered(true)"
      @mouseleave="setHovered(false)"
      :draggable="lgAndUp && !isSelected(item)"
      :class="[
        'item-card',
        'pa-4',
        isSelected(item) ? 'selected-item-card' : '',
        'd-flex',
        'flex-row'
      ]"
      style="height: 100%;"
    >
      <div
        :style="{
          transition: hovered ? '300ms ease-in-out' : '100ms',
          transitionDelay: hovered ? '100ms' : '0',
          width: '30px',
          height: '65px',
          position: 'absolute',
          opacity: hovered ? '1' : '0'
        }"
      >
        <div
          class="d-flex flex-column"
          style="position: relative; height: 100%; gap: 2px; transform: translateY(-5px)"
        >
          <v-icon>
            mdi-pin-outline
          </v-icon>
          <v-icon v-if="canEmail">
            mdi-email-fast-outline
          </v-icon>
          <v-icon>
            mdi-delete-outline
          </v-icon>
        </div>
      </div>
      <v-spacer></v-spacer>
      <div
        :style="{
          transition: '300ms ease-in-out',
          width: hovered ? 'calc(100% - 35px)' : '100%'
        }"
      >
        <slot></slot>
      </div>
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
import { emailValidator } from '../../EmailUtilities'
import { useSheetManager } from '../../store/useSheetManager'
import { useDocumentCache } from '../../store/useDocumentCache'
import { useDisplay } from 'vuetify'
import { ref, computed } from 'vue'

const { lgAndUp, smAndDown } = useDisplay()

const { getSelectedItems } = useDocumentCache()

const hovered = ref(false)

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

const canEmail = computed(() => {
  const email = props.item?.email
  return email && emailValidator(email)
})

const setHovered = (v: boolean) => {
  if (smAndDown.value) {
    return
  }
  hovered.value = v
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