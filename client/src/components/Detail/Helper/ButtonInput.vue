<template>
  <v-btn
    :color="panel.color + '-darken-2'"
    :disabled="readOnlyMode"
    size="x-small"
    class="mb-3"
  >
    <slot><!-- optional fallback --></slot>
  </v-btn>
</template>

<script setup lang="ts">
import { useSheetManager } from '../../../store/useSheetManager';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const sheetManager = useSheetManager();
const { getActivePanel, getActiveEmbeddedPanel, readOnlyMode } = storeToRefs(sheetManager);

const props = defineProps<{
  inputMedium?: 'DETAIL' | 'EMBEDDED',
}>()

const panel = computed(() => {
  if (props.inputMedium === 'EMBEDDED') {
    return getActiveEmbeddedPanel.value
  } else {
    return getActivePanel.value
  }
})
</script>