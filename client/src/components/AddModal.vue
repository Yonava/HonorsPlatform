<template>
  <v-dialog
    v-model="showDialog"
    max-width="600px"
  >
    <v-sheet 
      :color="`${panel.color}-lighten-5`"
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
          :color="`${panel.color}-darken-1`"
          indeterminate
        ></v-progress-circular>
      </div>
      <v-btn
        @click="reqAdd"
        :loading="loading"
        :color="`${panel.color}-darken-1`"
      >add {{ panel.title.slice(0, -1) }}</v-btn>
      <v-icon 
        @click="showDialog = false"
        class="ma-4"
        style="position: absolute; left: 0; top: 0; cursor: pointer;"
      >mdi-close</v-icon>
    </v-sheet>
  </v-dialog>
</template>

<script setup lang="ts">
import { Panel } from '../SwitchPanel'
import { addStudent, getHeaderRow } from '../SheetsAPI'
import { 
  ref, 
  toRef,
  defineProps, 
  defineEmits, 
  onMounted,
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
  }
})

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

onMounted(async () => {
  await initItem()
})

async function reqAdd() {
  if (!item.value.some(attr => attr)) {
    emits('close')
    return
  }
  loading.value = true
  await addStudent(item.value)
  await new Promise(resolve => setTimeout(resolve, 1000))
  const newItem = (await props.panel.mapData([item.value]))[0]
  emits('success', newItem)
  loading.value = false
}

async function initItem() {
  const panel = props.panel as Panel
  loading.value = true
  attrs.value = await getHeaderRow(panel.sheetRange)
  loading.value = false
  item.value = attrs.value.map(() => '')
}

const emits = defineEmits([
  'close',
  'success'
])
</script>

<style scoped>
.parent {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: white;
  border-radius: 15px;
  border: 5px solid #467ada;
}

.field-input {
  width: 250px; 
  margin-left: 10px; 
  margin-right: 10px;
}
</style>