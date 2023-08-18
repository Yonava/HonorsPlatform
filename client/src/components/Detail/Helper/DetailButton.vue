<template>
  <v-btn
    :color="getActivePanel.color + '-darken-2'"
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

const sheetManager = useSheetManager();
const { getActivePanel, readOnlyMode } = storeToRefs(sheetManager);
</script>