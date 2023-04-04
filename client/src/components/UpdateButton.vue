<template>
  <v-btn 
    @click="reqUpdate"
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
import { ref, inject, computed, toRefs, watch } from "vue";
import type { Ref } from 'vue'
import { useAutoSync, useChangeWatcher } from '../AutoSync'

const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

const props = defineProps<{
  itemName?: string,
  item: Ref<SheetItem>
}>()

watch(() => props.item, () => {
  console.log('item changed')
})

const { upToDate } = useChangeWatcher(() => props.item)
useAutoSync(reqUpdate)

const panel = inject("activePanel") as Ref<Panel<SheetItem>>

const itemName = computed(() => {
  return props?.itemName ?? panel.value.title.slice(0, -1)
})

const emits = defineEmits([
  'updated'
]);
const loading = ref(false);

async function reqUpdate() {
  if (upToDate.value) return
  upToDate.value = true
  loading.value = true
  await updateByRow(
    panel.value.sheetRange, 
    props.item.value.row, 
    await panel.value.mappers.unmap([
      props.item.value
    ])
  )
  emits('updated', clone(props.item.value))
  loading.value = false
}
</script>