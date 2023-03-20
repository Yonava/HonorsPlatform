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
        >mdi-file-document-plus</v-icon>
        <span>Add Module</span>
      </h1>
      <div class="d-flex flex-wrap justify-center align-center">
        <div
          v-for="(attr, index) in moduleAttrs"
          :key="index"
        >
          <v-text-field
            v-model="moduleData[index]"
            :label="attr"
            style="width: 250px; margin-left: 10px; margin-right: 10px;"
          ></v-text-field>
        </div>
      </div>
      <v-btn
        @click="reqAddModule"
        :loading="loading"
        color="blue-darken-1"
      >add module</v-btn>
      <v-icon 
        @click="showDialog = false"
        class="ma-4"
        style="position: absolute; left: 0; top: 0; cursor: pointer;"
      >mdi-close</v-icon>
    </v-sheet>
  </v-dialog>
</template>

<script setup>
import { addModule } from '../SheetsAPI'
import { 
  ref, 
  defineProps, 
  defineEmits, 
  onMounted,
  computed
} from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  studentId: {
    type: String,
    required: true
  }
})

const showDialog = computed({
  get: () => props.show,
  set: (val) => emits('close')
})

const loading = ref(false)
const moduleAttrs = ref(['Course Code', 'Description', 'Term'])
const moduleData = ref([])

onMounted(() => initModuleData())

function initModuleData() {
  moduleData.value = [
    ...moduleAttrs.value.map(() => '')
  ]
}

async function reqAddModule() {
  if (!moduleData.value.some(attr => attr)) {
    emits('close')
    return
  }
  loading.value = true
  moduleData.value.unshift(props.studentId)
  await addModule(moduleData.value)
  await new Promise(resolve => setTimeout(resolve, 1000))
  emits('close')
  emits('reFetchModules')
  initModuleData()
  loading.value = false
}

const emits = defineEmits([
  'close',
  'reFetchModules'
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