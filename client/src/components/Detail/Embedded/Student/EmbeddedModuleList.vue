<template>
  <div>
    <v-sheet
      v-for="mod in items"
      :key="mod.sysId"
      @click="select(mod)"
      :color="getActiveEmbeddedPanel.color + '-darken-2'"
      class="module-card pa-2 mt-2 d-flex flex-row align-center"
    >
      <div style="d-flex flex-column align-center">
        <div
          class="mb-2"
          style="color: white; opacity: 0.75; font-size: 0.75em;"
        >
          {{ mod.term || '(No Term)' }}
        </div>
        <div class="d-flex flex-row align-center mb-3">
          <h4 style="color: rgba(255,255,255,0.9); font-size: 1.25em; line-height: 0.3;">
            {{ mod.courseCode || '(No Course)' }}
          </h4>
          <span
            class="ml-2"
            style="color: white; line-height: 0.3; font-weight: 300;"
          >
            {{ mod.instructor || '(No Instructor)' }}
          </span>
        </div>
      </div>
      <v-icon
        v-if="!readOnlyMode"
        @click.stop="remove(mod)"
        color="white"
        style="cursor: pointer; margin-left: auto;"
        class="delete-module"
      >
        mdi-close
      </v-icon>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import { Module } from "../../../../SheetTypes"
import { useSheetManager } from '../../../../store/useSheetManager'
import { storeToRefs } from "pinia";

const sheetManager = useSheetManager()
const { getActiveEmbeddedPanel, readOnlyMode } = storeToRefs(sheetManager)

const props = defineProps<{
  items: Module[];
}>();

const emits = defineEmits([
  'selected',
  'delete'
]);

const select = (event: Module) => emits('selected', event);
const remove = (event: Module) => emits('delete', event);
</script>

<style scoped>
.module-card {
  border-radius: 5px;
  transition: 300ms;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
  cursor: pointer;
}

.delete-module {
  transition: 300ms;
}

.delete-module:hover {
  transform: scale(1.15);
}
</style>