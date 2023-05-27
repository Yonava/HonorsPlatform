<template>
  <div
    v-if="sortOptions.length > 0"
    class="pa-2"
    style="width: 100%"
  >
    <div class="d-flex flex-column align-center">
      <v-icon
        icon="mdi-sort"
      ></v-icon>
      <b style="font-size: 0.9rem;">
        Sort By
      </b>
      <div
        class="mt-2"
        style="background: white; width: 75%; height: 1px"
      ></div>
    </div>
    <div
      v-for="sortOption in sortOptions"
      :key="sortOption.label"
      @click="setKey(sortOption.label)"
      :style="{
        background: activeSortKey === sortOption.label ? 'rgba(255, 255, 255, 0.2)' : '',
        borderRadius: '10px'
      }"
      class="mt-1 sort-box d-flex justify-center align-center flex-column px-2"
    >
      <v-icon v-if="activeSortKey === sortOption.label">
        {{ ascending ? sortOption.icon.asc : sortOption.icon.desc }}
      </v-icon>
      <v-icon v-else>
        {{ sortOption.icon.asc }}
      </v-icon>
      <p style="font-size: 0.9rem; line-height: 1.1; user-select: none">
        {{ sortOption.label }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch
} from 'vue'
import { SheetItem } from '../../SheetTypes'
import { useSortItems, SortOptions } from '../../SortItems'

import { useSheetManager } from '../../store/useSheetManager'
import { storeToRefs, mapActions } from 'pinia'

const sheetManager = useSheetManager()
const { items, panel } = storeToRefs(sheetManager)
const { setItems } = mapActions(useSheetManager, [])

const itemList = computed({
  get: () => items.value,
  set: val => setItems(val)
})

const sortOptions = ref()
const sortOptionsObject = ref<SortOptions<SheetItem>>({})

const { setKey, activeSortKey, ascending } = useSortItems<SheetItem>(itemList, sortOptionsObject)

watch(panel, () => {
  setKey(null)
  sortOptions.value = panel.value.sortOptions

  sortOptionsObject.value = {}
  sortOptions.value.forEach(sort => {
    sortOptionsObject.value[sort.label] = sort.func
  })
}, { immediate: true })
</script>

<style scoped>
.sort-box {
  width: 100%;
  height: 65px;
  cursor: pointer;
  text-align: center;
}

.sort-box:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
