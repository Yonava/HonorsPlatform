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
        v-for="tool in panel.tools"
        :key="tool.name"
        @click="tool.handler"
        class="type-list-item"
      >
        {{ tool.name }}
      </v-list-item>
    </v-list>

  </v-menu>
</template>

<script setup lang="ts">
import { useSheetManager } from '../../store/useSheetManager'
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'

const showing = ref(false)

const sheetManager = useSheetManager()
const { panel } = storeToRefs(sheetManager)

const object = computed(() => {
  return {
    showing: showing.value,
    toolsAvailable: panel.value.tools.length > 0
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