<template>
  <div>
    <ModuleList
      v-if="!loadingModules"
      @delete="reqDeleteModule($event)"
      :modules="modules"
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
import { 
  ref, 
  watch,
  computed,
  defineProps, 
  defineEmits,
} from 'vue'
import { getModules, clearByRow } from '../SheetsAPI'
import ModuleList from '../components/ModuleList.vue'
import { mapModules } from '../DataMappers'

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

const emits = defineEmits(['toggleCanDelete'])

watch(() => props.studentId, async () => {
  await fetchModules()
}, { immediate: true })

watch(() => props.refetch, async () => {
  await fetchModules()
})

async function fetchModules() {
  loadingModules.value = true
  modules.value = mapModules(await getModules(props.studentId))
  loadingModules.value = false
}

const canBeDeleted = computed(() => {
  return modules.value.length === 0 && !loadingModules.value
})

watch(canBeDeleted, (val) => {
  emits('toggleCanDelete', val)
})

async function reqDeleteModule(row) {
  loadingModules.value = true
  await clearByRow('Modules', row)
  await new Promise(resolve => setTimeout(resolve, 1000))
  await fetchModules()
}
</script>