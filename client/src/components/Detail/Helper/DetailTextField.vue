<template>
  <v-text-field
    v-model="content"
    @input="broadcast(propName)"
    :prepend-icon="activeIcon"
    :readonly="false"
  ></v-text-field>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBroadcastThroughSocket } from '../../../TrackItemForUpdate'
import { useSheetManager } from '../../../store/useSheetManager';
import { storeToRefs } from 'pinia';

const { broadcast } = useBroadcastThroughSocket('DETAIL')
const { getFocusedItem } = storeToRefs(useSheetManager())

const props = defineProps<{
  propName: string,
  icon?: string,
}>()

const activeIcon = computed(() => {
  const icon = `mdi-${props.icon}` ?? ""
  return icon
})

const content = computed({
  get: () => {
    const item = getFocusedItem.value
    // @ts-ignore
    return item[props.propName]
  },
  set: (v: string) => {
    const item = getFocusedItem.value
    // @ts-ignore
    item[props.propName] = v
  }
})
</script>