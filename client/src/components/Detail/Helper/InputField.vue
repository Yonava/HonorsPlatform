<template>
  <div
    :style="{
      width: width ?? '100%',
    }"
  >

    <!-- optional button -->
    <ButtonInput
      v-if="button && button.condition"
      @click.stop="buttonClicked"
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
        @keydown="checkForTabAutocomplete"
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
        @keydown="checkForTabAutocomplete"
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
      @keydown="checkForTabAutocomplete"
      :items="activeInput.items"
      :prepend-inner-icon="activeIcon"
      :readonly="readOnlyMode"
      :variant="inputVariant"
    ></v-autocomplete>

    <v-select
      v-else-if="activeInput.type === 'select'"
      v-model="content"
      v-bind="$attrs"
      @keydown="checkForTabAutocomplete"
      :items="activeInput.items"
      :prepend-inner-icon="activeIcon"
      :readonly="readOnlyMode"
      :variant="inputVariant"
    ></v-select>

    <v-textarea
      v-else-if="activeInput.type === 'textarea'"
      v-model="content"
      v-bind="$attrs"
      :readonly="readOnlyMode"
      :variant="inputVariant"
      prepend-inner-icon="mdi-note"
      auto-grow
    ></v-textarea>

    <input
      v-else-if="activeInput.type === 'title'"
      v-model="content"
      v-bind="$attrs"
      :readonly="readOnlyMode"
      type="text"
      class="title"
    />

    <input
      v-else-if="activeInput.type === 'title-variant'"
      v-model="content"
      v-bind="$attrs"
      :readonly="readOnlyMode"
      type="text"
      class="title-variant mt-2"
    />

  </div>
</template>

<script setup lang="ts" generic="T extends SheetItem, K extends keyof T">
import { computed } from 'vue'
import { storeToRefs } from 'pinia';
import { useSheetManager } from '@store/useSheetManager';
import { useUpdateManager } from '@store/useUpdateManager';
import { broadcastPropUpdate } from '@utils/socketBroadcastWrappers'
import type { SheetItem } from '@apptypes/sheetItems'
import ButtonInput from './ButtonInput.vue'

const { readOnlyMode } = storeToRefs(useSheetManager())

type VuetifyInputVariant =
  | 'underlined'
  | 'outlined'
  | 'filled'
  | 'solo'
  | 'solo-inverted'
  | 'solo-filled'
  | 'plain'

const props = defineProps<{
  prop: K,
  item: T,
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
    } |
    {
      type: 'title-variant'
    }
  button?: {
    condition: boolean,
    newPropValue: () => T[K],
    text: string,
    disableCondition?: boolean,
  },
}>()

const checkForTabAutocomplete = (e: KeyboardEvent) => {
  const buttonActive = props.button && props.button.condition && !props.button.disableCondition
  if ( e.key === 'Tab' && !readOnlyMode.value && buttonActive) {
    e.preventDefault()
    e.stopPropagation()
    content.value = props.button.newPropValue()
  }
}

const broadcast = broadcastPropUpdate(props.item)

const { trackItemForUpdate } = useUpdateManager()

const buttonClicked = () => {
  if (!props.item || !props.button) {
    return
  }

  const oldVal = props.item[props.prop]
  const newVal = props.button.newPropValue()

  if (oldVal === newVal) {
    return
  }

  trackItemForUpdate({
    item: props.item,
    panelName: props.inputMedium === 'DETAIL' ? useSheetManager().getActivePanel.panelName : useSheetManager().getActiveEmbeddedPanel.panelName
  })

  props.item[props.prop] = newVal
  broadcast(props.prop)
}

const activeInput = computed(() => {
  const type = props.input ?? {
    type: 'text',
    variant: 'string'
  }
  return type
})

const activeIcon = computed(() => {
  if (!props.icon) return
  return `mdi-${props.icon}` as const
})

const content = computed({
  get() {
    return props.item[props.prop]
  },
  set(v) {
    const {
      getActivePanel: panel,
      getActiveEmbeddedPanel: embeddedPanel
    } = useSheetManager()

    const trackOptions = {
      item: props.item,
      panelName: props.inputMedium === 'DETAIL' ? panel.panelName : embeddedPanel.panelName
    } as const

    trackItemForUpdate(trackOptions)
    props.item[props.prop] = v
    broadcast(props.prop)
  }
})
</script>

<style scoped>
input.title {
  font-weight: 900;
  font-size: 3em;
  line-height: 0.9;
  width: 100%;
}

input.title:focus {
  outline: none;
}

input.title-variant {
  font-weight: 900;
  border: none;
  outline: none;
  width: 100%;
  font-size: 3rem;
}
</style>