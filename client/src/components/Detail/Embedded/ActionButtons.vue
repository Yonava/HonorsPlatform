<template>
  <div
    v-for="(action, index) in displayedActions"
    @click.stop="action.onClick(props.item)"
    @mouseover="hoveredAction = index"
    @mouseleave="hoveredAction = -1"
  >

    <v-icon
      :color="itemColor(index)"
      :class="{
        'action-icon': !smAndDown,
      }"
    >
      {{ action.icon(hoveredAction === index) }}
    </v-icon>

    <v-tooltip
      v-if="!smAndDown"
      activator="parent"
      location="bottom"
    >
      {{ action.tooltip }}
    </v-tooltip>

  </div>
</template>

<script setup lang="ts" generic="T">
import { ref, computed } from 'vue'
import { storeToRefs } from "pinia";
import { useDisplay } from 'vuetify'
import { useSheetManager } from '@store/useSheetManager'
import type { Action } from './EAction';

const sheetManager = useSheetManager()
const { readOnlyMode } = storeToRefs(sheetManager)

const { smAndDown } = useDisplay()

const hoveredAction = ref(-1);

const props = defineProps<{
  item: T;
  actions: Action<T>[];
}>();

const displayedActions = computed(() => {
  return props.actions.filter(action => !action.disableInReadOnlyMode || !readOnlyMode)
})

const itemColor = (index: number) => {
  if (smAndDown.value) return 'white'
  return hoveredAction.value === index ? 'white' : 'rgba(255,255,255,0.5)'
}
</script>

<style scoped>
.action-icon {
  transition: 300ms;
}

.action-icon:hover {
  transform: scale(1.25);
}
</style>