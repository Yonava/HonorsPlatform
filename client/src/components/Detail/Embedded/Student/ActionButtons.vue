<template>
  <div
    v-for="(action, index) in displayedActions"
    @click.stop="action.onClick(props.item)"
    @mouseover="hoveredAction = index"
    @mouseleave="hoveredAction = -1"
  >

    <v-icon
      :color="hoveredAction === index ? 'white' : 'rgba(255,255,255,0.5)'"
      class="action-icon"
    >
      {{ action.icon(hoveredAction === index) }}
    </v-icon>

    <v-tooltip
      activator="parent"
      location="top"
    >
      {{ action.tooltip }}
    </v-tooltip>

  </div>
</template>

<script setup lang="ts" generic="T">
import { ref, computed } from 'vue'
import { storeToRefs } from "pinia";
import { useSheetManager } from '@store/useSheetManager'
import type { Action } from './EAction';

const sheetManager = useSheetManager()
const { readOnlyMode } = storeToRefs(sheetManager)

const hoveredAction = ref(-1);

const props = defineProps<{
  item: T;
  actions: Action<T>[];
}>();

const displayedActions = computed(() => {
  return props.actions.filter(action => !action.disableInReadOnlyMode || !readOnlyMode)
})
</script>

<style scoped>
.action-icon {
  transition: 300ms;
}

.action-icon:hover {
  transform: scale(1.25);
}
</style>