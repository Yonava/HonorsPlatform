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
        <span>Add Student</span>
      </h1>
      <div class="d-flex flex-wrap justify-center align-center">
        <div
          v-for="(attr, index) in studentAttrs"
          :key="index"
        >
          <v-text-field
            v-if="attr"
            v-model="student[index]"
            :label="attr"
            style="width: 250px; margin-left: 10px; margin-right: 10px;"
          ></v-text-field>
        </div>
      </div>
      <v-btn
        color="blue-darken-1"
        @click="reqAddStudent"
      >add student</v-btn>
      <v-icon 
        @click="showDialog = false"
        class="ma-4"
        style="position: absolute; left: 0; top: 0; cursor: pointer;"
      >mdi-close</v-icon>
    </v-sheet>
  </v-dialog>
</template>

<script setup>
import { addStudent } from '../SheetsAPI'
import { 
  ref, 
  defineProps, 
  defineEmits, 
  onMounted,
  computed
} from 'vue'

const props = defineProps({
  studentAttrs: {
    type: Array,
    required: true
  },
  show: {
    type: Boolean,
    required: true
  }
})

const showDialog = computed({
  get: () => props.show,
  set: (val) => emits('close')
})

const student = ref([])

onMounted(() => initStudent())

async function reqAddStudent() {
  if (!student.value.some(attr => attr)) {
    emits('close')
    return
  }
  await addStudent(student.value)
  initStudent()
  emits('close')
  await new Promise(resolve => setTimeout(resolve, 1000))
  emits('reFetchStudents')
}

function initStudent() {
  student.value = props.studentAttrs.map(() => '')
}

const emits = defineEmits([
  'close',
  'reFetchStudents'
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