<template>
  <div style="width: 100%">
    <div v-if="activeInput.type === 'text'">

      <!-- text input -->
      <v-text-field
        v-if="activeInput.variant === 'string'"
        v-model="content"
        v-bind="$attrs"
        @input="broadcast(prop)"
        :prepend-icon="activeIcon"
        :readonly="false"
        type="text"
      ></v-text-field>

      <!-- number input -->
      <v-text-field
        v-else-if="activeInput.variant === 'number'"
        v-model.number="content"
        v-bind="$attrs"
        @input="broadcast(prop)"
        :prepend-icon="activeIcon"
        :readonly="false"
        type="number"
      ></v-text-field>

    </div>

    <v-autocomplete
      v-else-if="activeInput.type === 'autocomplete'"
      v-model="content"
      v-bind="$attrs"
      @input="broadcast(prop)"
      :items="activeInput.items"
      :prepend-icon="activeIcon"
      :readonly="false"
    ></v-autocomplete>

    <v-select
      v-else-if="activeInput.type === 'select'"
      v-model="content"
      v-bind="$attrs"
      @input="broadcast(prop)"
      :items="activeInput.items"
      :prepend-icon="activeIcon"
      :readonly="false"
    ></v-select>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBroadcastThroughSocket } from '../../../TrackItemForUpdate'
import { useSheetManager } from '../../../store/useSheetManager';
import { storeToRefs } from 'pinia';
import type { SheetItem } from '../../../SheetTypes'

const { broadcast } = useBroadcastThroughSocket('DETAIL')
const { getFocusedItem } = storeToRefs(useSheetManager())

const item = ref<SheetItem | null>(null)
item.value = getFocusedItem.value

const props = defineProps<{
  prop: string,
  icon?: string,
  input?:
    {
      type: 'text',
      variant: 'string' | 'number',
    } |
    {
      type: 'autocomplete',
      items: string[],
    } |
    {
      type: 'select',
      items: string[] | readonly string[],
    }
}>()

const activeInput = computed(() => {
  const type = props.input ?? { type: 'text', variant: 'string' }
  return type
})

const activeIcon = computed(() => {
  const icon = `mdi-${props.icon}` ?? ""
  return icon
})

const content = computed({
  get: () => {
    if (!item.value) return ''
    // @ts-ignore
    return item.value[props.prop]
  },
  set: (v: string) => {
    if (!item.value) return
    // @ts-ignore
    item.value[props.prop] = v
  }
})
</script>