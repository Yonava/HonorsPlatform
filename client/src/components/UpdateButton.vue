<template>
  <v-btn 
    @click="update"
    :loading="loading"
    :color="upToDate ? 'green' : `${panel.color}-darken-2`"
    :style="{
      cursor: upToDate ? 'default' : 'pointer',
    }"
    rounded
    class="ml-7"
  >
    {{ upToDate ? 'All Synced Up!' : `Update ${itemName}` }}
  </v-btn>
</template>

<script setup lang="ts">
import { Panel } from "../SwitchPanel";
import { SheetItem } from "../SheetTypes";
import { updateByRow } from "../SheetsAPI";
import { ref, inject, computed } from "vue";
import type { Ref } from 'vue'
import { useAutoSync, useChangeWatcher } from '../AutoSync'

const { upToDate } = useChangeWatcher()
useAutoSync(reqUpdate)

const props = defineProps<{
  itemName?: string
}>()

const itemName = computed(() => {
  return props?.itemName ?? panel.value.title.slice(0, -1)
})

const panel = inject("activePanel") as Ref<Panel<SheetItem>>
const selectedItem = inject("selectedItem") as Ref<SheetItem>

const emits = defineEmits([
  'updated'
]);
const loading = ref(false);

export async function reqUpdate() {
  if (upToDate.value) return
  loading.value = true
  await updateByRow(
    panel.value.sheetRange, 
    selectedItem.value.row, 
    await panel.value.mappers.unmap([
      selectedItem.value
    ])
  )
  upToDate.value = true
  loading.value = false
}
</script>