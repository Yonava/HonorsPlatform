<template>
  <v-dialog
    v-model="showDialog"
    max-width="600px"
  >
    <v-sheet 
      class="pa-5 parent"
      color="blue-lighten-5"
    >
      <h1 class="mb-3 d-flex align-center">
        <v-icon 
          class="mr-2"
          style="font-size: 2.5rem;"
        >mdi-account</v-icon>
        <span>Add {{ panel.title.slice(0, -1) }}</span>
      </h1>
      <div 
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
            style="width: 250px; margin-left: 10px; margin-right: 10px;"
          ></v-text-field>
        </div>
      </div>
      <v-btn
        @click="reqAdd"
        :loading="loading"
        color="blue-darken-1"
      >add {{ panel.title.slice(0, -1) }}</v-btn>
      <span 
        class="mt-2"
        style="color: red"
      >
        {{ errorMessage }}
      </span>
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

watch(() => props.panel, async () => {
  await initItem()
})

const showDialog = computed({
  get: () => props.show,
  set: (val) => emits('close')
})

const item = ref([])
const loading = ref(false)
const errorMessage = ref('')
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
  emits('success', (await props.panel.mapData([item.value]))[0])
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
</style>