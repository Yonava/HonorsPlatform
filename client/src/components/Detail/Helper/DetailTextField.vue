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
      :prepend-icon="icon"
      :readonly="false"
    ></v-autocomplete>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBroadcastThroughSocket } from '../../../TrackItemForUpdate'
import { useSheetManager } from '../../../store/useSheetManager';
import { storeToRefs } from 'pinia';

const { broadcast } = useBroadcastThroughSocket('DETAIL')
const { getFocusedItem } = storeToRefs(useSheetManager())

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
    const item = getFocusedItem.value
    // @ts-ignore
    return item[props.prop]
  },
  set: (v: string) => {
    const item = getFocusedItem.value
    // @ts-ignore
    item[props.prop] = v
  }
})
</script>