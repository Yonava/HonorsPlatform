<template>
  <v-menu v-model="showing">
    <template v-slot:activator="{ props }">
      <div v-bind="props">
        <slot
          name="showing"
          v-bind="object"
        ></slot>
      </div>
    </template>

    <v-list>
      <v-list-item
        v-for="tool in activeTools"
        :key="tool.name"
        @click="tool.handler"
        :disabled="readOnlyMode && tool.disableInReadOnly"
        class="type-list-item"
      >
        {{ tool.name }}
        <v-tooltip
          v-if="tool.tooltip"
          :disabled="smAndDown"
          activator="parent"
        >
          test
        </v-tooltip>
      </v-list-item>
    </v-list>

  </v-menu>
</template>

<script setup lang="ts">
import { useSheetManager } from '../../store/useSheetManager'
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import { tools } from '../../AdditionalTools'
import { useDisplay } from 'vuetify/lib/framework.mjs'

const { smAndDown } = useDisplay()

const showing = ref(false)

const sheetManager = useSheetManager()
const { getActivePanel, readOnlyMode } = storeToRefs(sheetManager)

const activeTools = computed(() => {
  return [
    ...tools[getActivePanel.value.panelName],
    ...tools['ALL']
  ]
})

const object = computed(() => {
  return {
    showing: showing.value,
    toolsAvailable: activeTools.value.length > 0
  }
})
</script>

<style scoped>
.type-list-text {
  font-size: 1.2em;
  font-weight: 700;
  text-transform: capitalize;
}
</style>