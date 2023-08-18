<template>
  <v-dialog
    v-model="idDialog"
    width="300"
  >
    <template #activator="{ props }">

      <!-- new id input -->
      <DetailButton
        v-if="!item.id"
        v-bind="props"
        @click="tempId = ''"
      >
        Add Student ID
      </DetailButton>

      <!-- edit id input -->
      <div
        v-else-if="!readOnlyMode"
        v-bind="props"
        @click="openIdDialog"
        class="d-flex align-center px-2 py-1 edit-id"
      >
        <div>
          {{ item.id }}
        </div>
        <v-icon
          size="small"
          style="opacity: 0.5;"
        >
          mdi-pencil
        </v-icon>
        <v-tooltip
          :disable="xs"
          activator="parent"
        >
          Edit Student ID
        </v-tooltip>
      </div>

      <!-- view id -->
      <div
        v-else
        class="d-flex align-center px-2 py-1 edit-id"
        style="cursor: default;"
      >
        <div>
          {{ item.id }}
        </div>
        <v-tooltip
          :disable="xs"
          activator="parent"
        >
          Student ID
        </v-tooltip>
      </div>

    </template>
    <v-sheet class="id-dialog pa-4">
      <v-text-field
        v-model="tempId"
        :rules="props.rules"
        label="Student ID"
        class="mb-2"
      ></v-text-field>
      <div class="d-flex">
        <v-btn
          @click="saveId"
          :disabled="invalidId"
          color="green"
        >
          Save
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          @click="idChangeCancelled"
          color="red"
        >
          Cancel
        </v-btn>
      </div>
    </v-sheet>
  </v-dialog>
</template>

<script setup lang="ts">
import DetailButton from './DetailButton.vue';
import { computed, ref } from 'vue'
import { useSheetManager } from '../../../store/useSheetManager'
import type { Student, Graduate } from '../../../SheetTypes'
import { useDisplay } from 'vuetify/lib/framework.mjs';
import { storeToRefs } from 'pinia';
import { useBroadcastThroughSocket } from '../../../TrackItemForUpdate';

const { broadcast } = useBroadcastThroughSocket('DETAIL')

const idDialog = ref(false)
const tempId = ref('')

const { xs } = useDisplay()
const sheetManager = useSheetManager()
const { readOnlyMode } = storeToRefs(sheetManager)

const props = defineProps<{
  item: Student | Graduate,
  rules?: any[]
}>()

const saveId = () => {
  idDialog.value = false
  props.item.id = tempId.value
  broadcast('id')
}

const idChangeCancelled = () => {
  idDialog.value = false
  tempId.value = props.item.id
}

const openIdDialog = () => {
  tempId.value = props.item.id
}

const invalidId = computed(() => {
  return !!props.rules?.some(rule => typeof rule(tempId.value) === 'string')
})
</script>

<style scoped>
.id-dialog {
  border-radius: 5px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
}

.edit-id:hover {
  background: rgba(0, 0, 0, 0.1);
}

.edit-id {
  transition: 0.3s;
  cursor: pointer;
  gap: 5px;
  border-radius: 5px;
  transform: translateX(-6px)
}
</style>