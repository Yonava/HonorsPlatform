<template>
  <div style="overflow: auto; max-height: 150px;">
    <div 
      v-for="mod in modules"
      :key="mod.courseCode"
      @click="showModuleDetailModal(mod)"
      class="module-card pa-2 mt-2 d-flex flex-row align-center"
    >
      <div style="d-flex flex-column align-center">
        <div style="color: white; opacity: 0.75; font-size: 0.75em;">
          {{ mod.term }}
        </div>
        <div class="d-flex flex-row align-center mb-1">
          <h4 style="color: rgba(255,255,255,0.9); font-size: 1.25em; line-height: 0;">
            {{ mod.courseCode }}
          </h4>
          <span 
            class="ml-2" 
            style="color: white; line-height: 1.1; font-weight: 300;"
          >{{ mod.description }}</span>
        </div>
      </div>
      <v-icon 
        @click.stop="reqDeleteModule(mod.row)"
        color="white"
        style="cursor: pointer; margin-left: auto;"
        class="delete-module"
      >
        mdi-close
      </v-icon>
    </div>
    <div v-if="modules.length === 0">
      <span style="color: red; font-size: 1.25em">
        No modules in progress
      </span>
    </div>
    <ModuleDetailModal 
      @close="showDetail = false"
      @update="emits('update', $event)"
      :show="showDetail"
      :module="selectedModule"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue'
import ModuleDetailModal from './ModuleDetailModal.vue'
import { Module } from '../SheetTypes'

const props = defineProps<{
  modules: Module[]
}>()

const showDetail = ref(false)
const selectedModule = ref<Module>(null)

function showModuleDetailModal(module: Module) {
  selectedModule.value = module
  showDetail.value = true
}

const emits = defineEmits(['delete', 'update'])
const reqDeleteModule = (row: number) => emits('delete', row)
</script>

<style scoped>
.module-card {
  background: #467ada;
  border-radius: 10px;
  transition: 300ms;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
  cursor: pointer;
}

.module-card:hover {
  background: #2559b9;  
}

.delete-module {
  transition: 300ms;
}

.delete-module:hover {
  transform: scale(1.15);
}
</style>