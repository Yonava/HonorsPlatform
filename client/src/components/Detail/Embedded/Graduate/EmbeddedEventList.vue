<template>
  <div>
    <div
      v-for="event in items"
      :key="event.sysId"
      @click="select(event)"
    >
      <v-sheet
        :color="getActiveEmbeddedPanel.color"
        class="pa-2 mb-2 d-flex flex-row justify-space-between align-center"
        style="cursor: pointer; border-radius: 5px"
        elevation="5"
      >
        <div class="d-flex flex-column">
          <div>

            <strong>
              Event:
            </strong>
            {{ event.event || '(No Event Name)' }}

          </div>
          <div>

            <strong>
              Date/Time:
            </strong>
            {{ event.dateTime || '(No Date/Time)' }}
          </div>

        </div>

        <v-icon
          v-if="!readOnlyMode"
          @click.stop="remove(event)"
          size="large"
          class="delete-icon"
        >
          mdi-close
        </v-icon>

      </v-sheet>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GradEngagement } from "../../../../SheetTypes"
import { useSheetManager } from '@store/useSheetManager'
import { storeToRefs } from "pinia";

const sheetManager = useSheetManager()
const { getActiveEmbeddedPanel, readOnlyMode } = storeToRefs(sheetManager)

const props = defineProps<{
  items: GradEngagement[];
}>();

const emits = defineEmits([
  'selected',
  'delete'
]);

const select = (event: GradEngagement) => emits('selected', event);
const remove = (event: GradEngagement) => emits('delete', event);
</script>

<style scoped>
.delete-icon {
  transition: 0.3s;
}
.delete-icon:hover {
  transform: scale(1.2);
}
</style>