<template>
  <v-btn 
    icon
    @click="reqUpdate"
    :loading="loading"
    :color="upToDate ? 'green' : `${panel.color}-darken-2`"
    :style="{
      cursor: upToDate ? 'default' : 'pointer',
    }"
    rounded
    class="ml-7"
  >
    <v-icon
      :icon="upToDate ? 'mdi-check' : 'mdi-cloud-upload'"
    ></v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { Panel } from "../SwitchPanel";
import { SheetItem } from "../SheetTypes";
import { updateByRow } from "../SheetsAPI";
import { ref, inject, computed, toRefs, watch } from "vue";
import type { Ref } from 'vue'
import { useAutoSync } from '../AutoSync'

const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

const props = defineProps<{
  item: SheetItem
}>()

const { item } = toRefs(props)

useAutoSync(reqUpdate)

const panel = inject("activePanel") as Ref<Panel<SheetItem>>

const emits = defineEmits([
  'updated'
]);

const loading = ref(false);
const upToDate = ref(false);
const cooldown = ref(false);

async function reqUpdate() {
  if (upToDate.value) return
  upToDate.value = true
  cooldown.value = true
  setTimeout(() => cooldown.value = false, 500)
  loading.value = true
  await updateByRow(
    panel.value.sheetRange, 
    props.item.row, 
    await panel.value.mappers.unmap([
      props.item
    ])
  )
  emits('updated', clone(props.item))
  loading.value = false
}

watch(item,
  () => {
    if (cooldown.value) return
    upToDate.value = false
    console.log('item changed')
  }, 
  { deep: true }
)
</script>