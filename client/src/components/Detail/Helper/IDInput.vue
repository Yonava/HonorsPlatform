<template>
  <v-dialog
    v-model="idDialog"
    width="300"
  >
    <template #activator="{ props }">

      <!-- new id input -->
      <ButtonInput
        v-if="!item.id"
        v-bind="props"
        @click="openIdDialog"
      >
        Add Student ID
      </ButtonInput>

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
        @keyup.enter="saveId"
        :rules="rules"
        ref="idInput"
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
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia';
import { useDisplay } from 'vuetify';
import { useSheetManager } from '@store/useSheetManager'
import { useUpdateManager } from '@store/useUpdateManager';
import { useInputFocus } from '@composables/useInputFocus';
import { broadcastPropUpdate } from '@utils/socketBroadcastWrappers';
import ButtonInput from './ButtonInput.vue';
import type { Student, Graduate } from '../../../SheetTypes'
import { studentIdRule } from '../../../StudentTools';

const props = defineProps<{
  item: Student | Graduate
}>()

const broadcast = broadcastPropUpdate(props.item)

const idInput = ref()
const { focus } = useInputFocus(idInput)

const idDialog = ref(false)
const tempId = ref('')

const { xs } = useDisplay()
const sheetManager = useSheetManager()
const { readOnlyMode, getActivePanel } = storeToRefs(sheetManager)

const rules = computed(() => [(v: string) => studentIdRule(v, props.item.sysId)])
const invalidId = computed(() => rules.value.some(rule => typeof rule(tempId.value) === 'string'))

const saveId = () => {
  if (invalidId.value) return
  idDialog.value = false
  if (props.item.id === tempId.value) return
  useUpdateManager().trackItemForUpdate({
    item: props.item,
    panelName: getActivePanel.value.panelName
  })
  props.item.id = tempId.value
  broadcast('id')
}

const idChangeCancelled = () => {
  idDialog.value = false
  tempId.value = props.item.id
}

const openIdDialog = () => {
  tempId.value = props.item.id
  focus()
}
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