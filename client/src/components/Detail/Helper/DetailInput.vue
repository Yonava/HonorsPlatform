<template>
  <InputField
    v-bind="$attrs"
    :prop="props.prop"
    :item="props.item"
    :icon="icon"
    :input="input"
    :button="button"
    :inputVariant="config.inputVariant"
    :inputMedium="config.inputMedium"
    :width="width"
  />
</template>

<script setup lang="ts" generic="T extends SheetItem, K extends keyof T">
import type { SheetItem } from '@apptypes/sheetItems';
import InputField from './InputField.vue'

const config = {
  inputVariant: 'filled',
  inputMedium: 'DETAIL'
} as const

const props = defineProps<{
  prop: K,
  item: T,
  icon?: string,
  width?: string,
  input?:
    {
      type: 'text',
      variant: 'string' | 'number',
    } |
    {
      type: 'autocomplete',
      items: T[K][] | readonly T[K][],
    } |
    {
      type: 'select',
      items: T[K][] | readonly T[K][],
    } |
    {
      type: 'textarea',
    } |
    {
      type: 'title',
    } | {
      type: 'title-variant'
    }
  button?: {
    condition: boolean,
    newPropValue: () => T[K],
    text: string,
    disableCondition?: boolean,
  }
}>()
</script>