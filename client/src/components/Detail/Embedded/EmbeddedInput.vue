<template>
  <InputField
    v-bind="$attrs"
    :prop="prop"
    :item="item"
    :icon="icon"
    :width="width"
    :input="input"
    :button="button"
    :inputVariant="config.inputVariant"
    :inputMedium="config.inputMedium"
  />
</template>

<script setup lang="ts">
import InputField from '../Helper/InputField.vue'
import type { SheetItem } from '../../../SheetTypes';

const config = {
  inputVariant: 'outlined',
  inputMedium: 'EMBEDDED'
} as const

const props = defineProps<{
  prop: string,
  item: SheetItem
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
    } | {
      type: 'title-variant'
    }
  button?: {
    condition: boolean,
    newPropValue: () => string | number | boolean,
    text: string,
    disableCondition?: boolean,
  }
}>()
</script>