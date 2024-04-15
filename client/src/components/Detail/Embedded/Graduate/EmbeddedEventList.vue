<template>
  <div>
    <div
      v-for="event in items"
      @click="select(event)"
      :key="event.sysId"
    >
      <v-sheet
        :color="getActiveEmbeddedPanel!.color"
        class="pa-2 mb-2 d-flex flex-row justify-space-between align-center"
        style="cursor: pointer; border-radius: 5px"
        elevation="5"
      >
        <div class="d-flex flex-column">
          <div>

            <span style="font-weight: 900;">
              Event:
            </span>
            {{ event.event || '(No Event Name)' }}

          </div>
          <div>

            <span style="font-weight: 900;">
              Date/Time:
            </span>
            {{ event.dateTime || '(No Date/Time)' }}
          </div>

        </div>

        <v-spacer></v-spacer>

        <div
          class="d-flex"
          style="gap: 10px;"
        >

          <ActionButtons
            v-if="!readOnlyMode"
            :item="event"
            :actions="actions"
          />

        </div>

      </v-sheet>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GradEngagement } from "@apptypes/sheetItems"
import { useSheetManager } from '@store/useSheetManager'
import { storeToRefs } from "pinia";
import ActionButtons from "../ActionButtons.vue";
import { useActions } from "../EAction";

const sheetManager = useSheetManager()
const { getActiveEmbeddedPanel, readOnlyMode } = storeToRefs(sheetManager)

defineProps<{
  items: GradEngagement[];
}>();

const emits = defineEmits([
  'selected',
  'delete'
]);

const select = (event: GradEngagement) => emits('selected', event);
const remove = (event: GradEngagement) => emits('delete', event);

const actions = useActions(remove)
</script>