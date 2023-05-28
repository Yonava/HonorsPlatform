<template>
  <ModalContent
    v-model="showDialog"
    :bgColor="`${panel.color}-lighten-5`"
  >
    <v-sheet
      :color="`${panel.color}-lighten-5`"
      :style="{
        border: xs ? '' : `5px solid ${panel.color}`,
      }"
      class="pa-5 parent"
    >
      <h1
        style="white-space: nowrap"
        :class="[
          'mb-3',
          'mt-5',
          'd-flex',
          'align-center'
        ]"
      >
        <v-icon
          class="mr-2"
          style="font-size: 2.5rem;"
        >{{ panel.icon }}</v-icon>
        <span>
          Add {{ panel.title.singular }}
        </span>
      </h1>
      <div
        v-if="!loading"
        @keyup.enter="reqAdd"
        class="d-flex flex-wrap justify-center align-center"
      >
        <div
          v-for="(attr, index) in attrs"
          :key="index"
        >
          <v-text-field
            v-if="attr"
            v-model="item[index]"
            :label="attr"
            :style="`width: ${xs ? '150' : '200'}px;`"
            class="mx-2"
          ></v-text-field>
        </div>
      </div>
      <div
        v-else
        class="d-flex justify-center align-center mb-12"
      >
        <v-progress-circular
          :color="`${panel.color}-darken-1`"
          indeterminate
        ></v-progress-circular>
      </div>
      <v-btn
        @click="reqAdd"
        :loading="loading"
        :color="`${panel.color}-darken-1`"
      >add {{ panel.title.singular }}</v-btn>
      <v-icon
        @click="showDialog = false"
        class="close-dialog ma-4"
      >mdi-close</v-icon>
    </v-sheet>
  </ModalContent>
</template>

<script setup lang="ts">
import { SheetItem } from '../SheetTypes'
import { postInRange, getHeaderRow, headerRowMemo } from '../SheetsAPI'
import { useDisplay } from 'vuetify'
import {
  ref,
  toRef,
  computed,
  watch
} from 'vue'
import ModalContent from './ModalContent.vue'
import { useSheetManager } from "../store/useSheetManager"
import { storeToRefs } from 'pinia'

const sheetManager = useSheetManager()
const { panel } = storeToRefs(sheetManager)

const props = defineProps<{
  show: boolean
}>()

const emits = defineEmits([
  'close'
])

const showDialog = computed({
  get: () => props.show,
  set: () => emits('close')
})

watch(showDialog, async (val) => {
  if (val) {
    await initItem()
  }
})

const { xs } = useDisplay()

const item = ref<string[]>([])
const loading = ref(false)
const attrs = ref<string[]>([])

async function reqAdd() {
  if (!item.value.some(attr => attr)) {
    emits('close')
    return
  }
  loading.value = true
  await postInRange(panel.value.sheetRange, [item.value])
  const newItem = (await panel.value.mappers.map([item.value]))[0]
  sheetManager.addItem(newItem)
  emits('close')
  loading.value = false
}

async function initItem() {
  loading.value = true
  const range = panel.value.sheetRange
  attrs.value = headerRowMemo[range] ?? await getHeaderRow(range)
  loading.value = false
}
</script>

<style scoped>
.parent {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 15px;
}

.close-dialog {
  position: absolute;
  left: 0;
  top: 0;
  cursor: pointer;
}
</style>