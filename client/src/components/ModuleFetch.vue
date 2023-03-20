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

<script setup lang="ts">
import { ref, defineProps, watch } from 'vue'
import { getModules } from '../SheetsAPI'
import ModuleList from '../components/ModuleList.vue'

const modules = ref([])
const loadingModules = ref(false)

const props = defineProps({
  studentId: {
    type: String,
    required: true
  },
  refetch: {
    type: Boolean,
    required: true
  }
})

watch(() => props.studentId, async () => {
  await fetchModules()
}, { immediate: true })

watch(() => props.refetch, async () => {
  await fetchModules()
})

async function fetchModules() {
  loadingModules.value = true
  modules.value = await getModules(props.studentId)
  loadingModules.value = false
}

function reqDeleteModule(moduleCourseCode) {
  // make a request to delete the module
  modules.value.splice(modules.value.findIndex(module => module.courseCode === moduleCourseCode), 1)
}
</script>