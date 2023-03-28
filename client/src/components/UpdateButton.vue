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
    {{ upToDate ? 'All Synced Up!' : `Update ${panel.title.slice(0, -1)}` }}
  </v-btn>
</template>

<script setup lang="ts">
import { Panel } from "../SwitchPanel";
import { SheetItem } from "../SheetTypes";
import { updateByRow } from "../SheetsAPI";
import { ref } from "vue";

const props = defineProps<{
  panel: Panel<SheetItem>;
  item: SheetItem;
  upToDate: boolean;
}>();

const emits = defineEmits(["updated"]);
const loading = ref(false);

async function update() {
  if (props.upToDate) return
  loading.value = true
  await updateByRow(
    props.panel.sheetRange, 
    props.item.row, 
    await props.panel.mappers.unmap([props.item])
  )
  emits('updated')
  loading.value = false
}
</script>