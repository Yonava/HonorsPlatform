<template>
  <div style="width: 100%">
    <div v-if="!loading">
      <div
        style="position: relative; width: 100%"
        class="d-flex flex-column align-center"
      >
        <div
          v-for="item in items.slice(0, itemsToDisplay)"
          :key="item"
          @click="selectedItem = item"
          :class="[
            'item-card',
            'pa-3',
            isSelected(item) ? 'selected-item-card' : ''
          ]"
        >
          <component
            :is="panel.components.list"
            :item="item"
          />
        </div>
      </div>
      <v-sheet
        v-if="items.length === 0"
        class="mt-2"
        style="width: 90%; border-radius: 10px; margin: 0 auto;"
        :color="`${panel.color}-darken-1`"
        elevation="3"
      >
        <div
          style="text-align: center;"
          class="d-flex justify-center flex-column pa-4"
        >
          <h3>
            <v-icon class="mr-1 mb-1">
              {{ panel.icon }}
            </v-icon>
            no {{ panel.title.plural.toLowerCase() }} in system
          </h3>
          <span v-if="filterQuery">
            try clearing "{{ filterQuery }}" from the search filter
            to view all {{ panel.title.plural.toLowerCase() }}
          </span>
        </div>
      </v-sheet>
    </div>
    <div v-else>
      <div class="d-flex justify-center">
        <v-progress-circular
          :color="`${panel.color}-darken-4`"
          size="32"
          indeterminate
          class="mt-12"
        ></v-progress-circular>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  toRefs,
  watch
} from 'vue'
import { SheetItem } from '../../SheetTypes'
import { Panel } from '../../SwitchPanel'

const props = defineProps<{
  items: SheetItem[],
  selected: SheetItem,
  loading: boolean,
  panel: Panel<SheetItem>,
  filterQuery: string,
  pinnedItem: SheetItem | null
}>()

const emits = defineEmits(['select'])

const selectedItem = computed({
  get: () => props.selected,
  set: item => emits('select', item)
})

const items = computed(() => {
  if (!props.pinnedItem) return props.items
  else {
    const index = props.items.findIndex((i) => {
      return props.panel.keys.every(key => i[key] === props.pinnedItem[key]);
    })
    if (index === -1) return props.items
    const pinnedItem = props.items[index]
    const items = [...props.items]
    items.splice(index, 1)
    items.unshift(pinnedItem)
    return items
  }
})

const itemsToDisplay = ref(items.value.length)

let updateInterval;
watch(items, () => {
  if (itemsToDisplay.value !== items.value.length) {
    clearInterval(updateInterval)
    updateInterval = setInterval(() => {
      if (itemsToDisplay.value === items.value.length) {
        clearInterval(updateInterval)
        return
      }
      else if (itemsToDisplay.value > items.value.length) itemsToDisplay.value = items.value.length
      else if (itemsToDisplay.value < items.value.length) itemsToDisplay.value = itemsToDisplay.value + 1
    }, 25)
  }
})

const isSelected = item => {
  if (!selectedItem.value) return false
  return selectedItem.value.row === item.row
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