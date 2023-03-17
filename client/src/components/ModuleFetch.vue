<template>
  <div>
    <ModuleList
      v-if="!loadingModules"
      :modules="modules"
      @delete="reqDeleteModule($event)"
    />
    <div 
      v-else
      class="d-flex justify-center my-5"
    >
      <v-progress-circular 
        indeterminate
        color="blue"
      ></v-progress-circular>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, watch } from 'vue'
import ModuleList from '../components/ModuleList.vue'

const modules = ref([])
const loadingModules = ref(false)

const props = defineProps({
  studentId: {
    type: String,
    required: true
  }
})

watch(() => props.studentId, async () => {
  await fetchModules()
}, { immediate: true })

async function fetchModules() {
  loadingModules.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  modules.value = [
    {
      courseCode: `CS${Math.floor(Math.random() * 1000)}`,
      description: 'this is a short description of the module'
    },
    {
      courseCode: `MAT${Math.floor(Math.random() * 1000)}`,
      description: 'this is a short description of the module'
    },
    {
      courseCode: `HIS${Math.floor(Math.random() * 1000)}`,
      description: 'this is a short description of the module'
    }
  ]
  loadingModules.value = false
}

function reqDeleteModule(moduleCourseCode) {
  // make a request to delete the module
  console.log(props.studentId, moduleCourseCode)
}
</script>