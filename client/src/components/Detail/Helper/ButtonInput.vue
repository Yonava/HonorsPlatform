<template>
  <v-btn
    :color="panel.color + '-darken-1'"
    :disabled="disabled"
    size="x-small"
    class="mb-3"
  >
    <slot><!-- optional fallback --></slot>
  </v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSheetManager } from '@store/useSheetManager';

const sheetManager = useSheetManager();
const {
  getActivePanel,
  getActiveEmbeddedPanel,
  readOnlyMode
} = storeToRefs(sheetManager);

const props = defineProps<{
  inputMedium?: 'DETAIL' | 'EMBEDDED',
  disableCondition?: boolean,
}>()

const disabled = computed(() => {
  return readOnlyMode.value || props.disableCondition
})

const panel = computed(() => {
  if (props.inputMedium === 'EMBEDDED') {
    return getActiveEmbeddedPanel.value
  } else {
    return getActivePanel.value
  }
})
</script>