<template>
  <v-sheet
    style="height: 100%; overflow: auto;"
    class="d-flex flex-grow-1 flex-column align-center"
  >
    <div
      v-if="getSelectedItem()"
      style="width: 100%"
    >
      <component :is="getActivePanel.components.detail" />
    </div>
    <div
      v-else
      class="d-flex flex-column align-center justify-center"
    >
      <v-icon style="font-size: 35vw; opacity: 0.1;">
        {{ getActivePanel.icon }}
      </v-icon>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { useSheetManager } from '../../store/useSheetManager';
import { useDocumentCache } from '../../store/useDocumentCache';

const sheetManager = useSheetManager()
const { getActivePanel } = sheetManager

const { getSelectedItem } = useDocumentCache()
</script>