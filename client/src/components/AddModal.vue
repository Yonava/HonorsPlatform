<template>
  <v-dialog
    v-model="showDialog"
    max-width="600px"
  >
    <v-sheet 
      :color="`${color}-lighten-5`"
      :style="{
        border: `5px solid ${color}`,
      }"
      class="pa-5 parent"
    >
      <h1 class="mb-3 d-flex align-center">
        <v-icon 
          class="mr-2"
          style="font-size: 2.5rem;"
        >{{ panel.icon }}</v-icon>
        <span>Add {{ panel.title.slice(0, -1) }}</span>
      </h1>
      <div 
        @keyup.enter="reqAdd"
        v-if="!loading"
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
            class="field-input"
          ></v-text-field>
        </div>
      </div>
      <div 
        v-else
        class="d-flex justify-center align-center mb-12"
      >
        <v-progress-circular
          :color="`${color}-darken-1`"
          indeterminate
        ></v-progress-circular>
      </div>
      <v-btn
        @click="reqAdd"
        :loading="loading"
        :color="`${color}-darken-1`"
      >add {{ panel.title.slice(0, -1) }}</v-btn>
      <v-icon 
        @click="showDialog = false"
        class="close-dialog ma-4"
      >mdi-close</v-icon>
    </v-sheet>
  </v-dialog>
</template>

<script setup lang="ts">
import { Panel } from '../SwitchPanel'
import { postInRange, getHeaderRow, headerRowMemo } from '../SheetsAPI'
import { 
  ref, 
  toRef,
  defineProps, 
  defineEmits, 
  computed,
  watch
} from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  panel: {
    type: Object,
    required: true
  },
  override: {
    type: Object,
    required: false
  }
})

const emits = defineEmits([
  'close',
  'success'
])

const showDialog = computed({
  get: () => props.show,
  set: (val) => emits('close')
})

watch(showDialog, async (val) => {
  if (val) {
    await initItem()
  }
})

const item = ref([])
const loading = ref(false)
const attrs = ref([])

async function reqAdd() {
  if (!item.value.some(attr => attr)) {
    emits('close')
    return
  }
  loading.value = true
  await postInRange(props.panel.sheetRange, [item.value])
  await new Promise(resolve => setTimeout(resolve, 500))
  const newItem = (await props.panel.mappers.map([item.value]))[0]
  emits('success', newItem)
  emits('close')
  await new Promise(resolve => setTimeout(resolve, 500))
  loading.value = false
}

async function initItem() {
  const panel = props.panel as Panel
  loading.value = true
  attrs.value = headerRowMemo[panel.sheetRange] ?? await getHeaderRow(panel.sheetRange)
  loading.value = false
  item.value = attrs.value.map((attr, index) => {
    return props?.override?.predefineColumnData[index] ?? ''
  })
}

const color = computed(() => {
  return props?.override?.color ?? props.panel.color
})
</script>

<style scoped>
.parent {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: white;
  border-radius: 15px;
}

.field-input {
  width: 250px; 
  margin-left: 10px; 
  margin-right: 10px;
}

.close-dialog {
  position: absolute; 
  left: 0; 
  top: 0; 
  cursor: pointer;
}
</style>