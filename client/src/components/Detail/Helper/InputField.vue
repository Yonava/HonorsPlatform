<template>
  <div
    :style="{
      width: width ?? '100%',
    }"
  >

    <!-- optional button -->
    <ButtonInput
      v-if="button && button.condition"
      @click="buttonClicked"
      :inputMedium="inputMedium"
      :disableCondition="button.disableCondition"
    >
      {{ button.text }}
    </ButtonInput>

    <div v-if="activeInput.type === 'text'">

      <!-- text input -->
      <v-text-field
        v-if="activeInput.variant === 'string'"
        v-model="content"
        v-bind="$attrs"
        @input="broadcast(prop)"
        :prepend-inner-icon="activeIcon"
        :readonly="readOnlyMode"
        :variant="inputVariant"
        type="text"
      ></v-text-field>

      <!-- number input -->
      <v-text-field
        v-else-if="activeInput.variant === 'number'"
        v-model.number="content"
        v-bind="$attrs"
        @input="broadcast(prop)"
        :prepend-inner-icon="activeIcon"
        :readonly="readOnlyMode"
        :variant="inputVariant"
        type="number"
      ></v-text-field>

    </div>

    <v-autocomplete
      v-else-if="activeInput.type === 'autocomplete'"
      v-model="content"
      v-bind="$attrs"
      @update:model-value="broadcast(prop)"
      :items="activeInput.items"
      :prepend-inner-icon="activeIcon"
      :readonly="readOnlyMode"
      :variant="inputVariant"
    ></v-autocomplete>

    <v-select
      v-else-if="activeInput.type === 'select'"
      v-model="content"
      v-bind="$attrs"
      @update:model-value="broadcast(prop)"
      :items="activeInput.items"
      :prepend-inner-icon="activeIcon"
      :readonly="readOnlyMode"
      :variant="inputVariant"
    ></v-select>

    <v-textarea
      v-else-if="activeInput.type === 'textarea'"
      v-model="content"
      v-bind="$attrs"
      @input="broadcast(prop)"
      prepend-inner-icon="mdi-note"
      :readonly="readOnlyMode"
      auto-grow
      :variant="inputVariant"
    ></v-textarea>

    <input
      v-else-if="activeInput.type === 'title'"
      v-model="content"
      v-bind="$attrs"
      @input="broadcast(prop)"
      :readonly="readOnlyMode"
      type="text"
      class="header-input"
    >

  </div>
</template>

<script setup lang="ts">
import ButtonInput from './ButtonInput.vue'
import { computed } from 'vue'
import { useBroadcastThroughSocket } from '../../../TrackItemForUpdate'
import { useSheetManager } from '../../../store/useSheetManager';
import { storeToRefs } from 'pinia';
import type { SheetItem } from '../../../SheetTypes'

const { readOnlyMode } = storeToRefs(useSheetManager())

type VuetifyInputVariant =
  'outlined' |
  'underlined' |
  'solo' |
  'filled' |
  'plain' |
  undefined

const props = defineProps<{
  prop: string,
  item: SheetItem
  inputMedium: 'DETAIL' | 'EMBEDDED',
  inputVariant?: VuetifyInputVariant,
  width?: string,
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
    } |
    {
      type: 'textarea',
    } |
    {
      type: 'title',
    },
  button?: {
    condition: boolean,
    newPropValue: () => string | number | boolean,
    text: string,
    disableCondition?: boolean,
  },
}>()

const { broadcast } = useBroadcastThroughSocket(props.inputMedium)

const buttonClicked = () => {
  if (!props.item) {
    return
  }
  // @ts-ignore
  props.item[props.prop] = props.button?.newPropValue()
  broadcast(props.prop)
}

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
    if (!props.item) {
      return ""
    }
    // @ts-ignore
    return props.item[props.prop]
  },
  set: (v: string) => {
    if (!props.item) {
      return
    }
    // @ts-ignore
    props.item[props.prop] = v
  }
})
</script>

<style scoped>
input.header-input {
  font-weight: 900;
  font-size: 3em;
  line-height: 0.9;
  width: 100%;
}

input.header-input:focus {
  outline: none;
}</style>