<template>
  <v-menu v-model="open">
    <template v-slot:activator="{ props }">
      <div v-bind="props">
        <slot
          name="activator"
          v-bind="{ open, activeTools }"
        >
          <v-btn
            v-if="activeTools.length"
            icon
          >

            <v-icon
              icon="mdi-hammer"
              size="large"
            ></v-icon>

            <v-tooltip
              :disabled="smAndDown || open"
              activator="parent"
              location="bottom"
            >
              Additional Tools
            </v-tooltip>

          </v-btn>
        </slot>
      </div>
    </template>

    <v-list>
      <v-list-item
        v-for="tool in activeTools"
        @click="tool.handler"
        :key="tool.name"
        :disabled="readOnlyMode && tool.disableInReadOnly"
      >
        <template #prepend>
          <div class="mr-3">
            <v-icon color="grey-darken-2">{{ tool.icon }}</v-icon>
          </div>
        </template>
        <template #title>
          {{ tool.name }}
        </template>
      </v-list-item>
    </v-list>

  </v-menu>
</template>

<script setup lang="ts">
import { useSheetManager } from '@store/useSheetManager'
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import { tools } from '../../../AdditionalTools'
import { useDisplay } from 'vuetify/lib/framework.mjs'

const { smAndDown } = useDisplay()

const open = ref(false)

const sheetManager = useSheetManager()
const { getActivePanel, readOnlyMode } = storeToRefs(sheetManager)

const activeTools = computed(() => {
  return [
    ...tools[getActivePanel.value.panelName],
    ...tools['ALL']
  ]
})
</script>

<style scoped>
.type-list-text {
  font-size: 1.2em;
  font-weight: 700;
  text-transform: capitalize;
}
</style>