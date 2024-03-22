<template>
  <div
    :style="{
      transition: show ? '300ms ease-in-out' : '100ms',
      transitionDelay: show ? '100ms' : '0',
      pointerEvents: show ? 'all' : 'none',
      opacity: show ? '1' : '0',
      width: '30px',
      position: 'absolute'
    }"
  >

    <div
      class="d-flex flex-column"
      style="position: relative; height: 100%; gap: 2px; transform: translateY(-5px)"
    >
      <div
        v-for="{ icon, onClick, tooltip, actionId } in sidebarActions"
        :key="actionId"
        @click.stop="onClick"
        @mouseover="hoveredAction = actionId"
        @mouseleave="hoveredAction = null"
      >

        <v-icon>
          {{ icon(hoveredAction === actionId) }}
        </v-icon>

        <v-tooltip activator="parent">
          {{ tooltip }}
        </v-tooltip>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSidebarActions, type SidebarAction } from '@composables/useSidebarActions'
import type { SheetItem } from '@apptypes/sheetItems'
import { emailAction, jumpToProfileAction } from './HonorsSidebarActions'

const props = defineProps<{
  show: boolean,
  item: SheetItem
}>()

type ActionId = SidebarAction['actionId']
const hoveredAction = ref<ActionId | null>(null)

const sidebarActions = useSidebarActions(props.item, {
  'STUDENTS': emailAction,
  'GRADUATES': emailAction,
  'MODULES': jumpToProfileAction,
  'COMPLETED_MODULES': jumpToProfileAction,
  'THESES': jumpToProfileAction,
  'GRADUATE_ENGAGEMENTS': jumpToProfileAction,
})
</script>