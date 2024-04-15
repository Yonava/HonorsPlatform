<template>
  <div>
    <v-sheet
      v-for="mod in items"
      :key="mod.sysId"
      @click="select(mod)"
      :color="getActiveEmbeddedPanel.color + '-darken-2'"
      class="module-card pa-2 mt-2 d-flex flex-row align-center"
    >
      <div>
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

      <v-spacer></v-spacer>

      <div
        class="d-flex"
        style="gap: 10px;"
      >

        <ActionButtons
          v-if="!readOnlyMode"
          :item="mod"
          :actions="actions"
        />

      </div>
    </v-sheet>

  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useSheetManager } from '@store/useSheetManager'
import type { Module } from "@apptypes/sheetItems"
import ActionButtons from './ActionButtons.vue';
import { useActions } from './EAction';

const sheetManager = useSheetManager()
const { getActiveEmbeddedPanel, readOnlyMode } = storeToRefs(sheetManager)

defineProps<{
  items: Module[];
}>();

const emits = defineEmits([
  'selected',
  'delete'
]);

const select = (event: Module) => emits('selected', event);
const remove = (event: Module) => emits('delete', event);

const actions = useActions(remove)
</script>

<style scoped>
.module-card {
  border-radius: 5px;
  transition: 300ms;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
  cursor: pointer;
}

.module-card:hover {
  background: rgb(255, 145, 19) !important;
}
</style>