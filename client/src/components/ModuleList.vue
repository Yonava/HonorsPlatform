<template>
  <div style="overflow: auto; max-height: 200px;">
    <div 
      v-for="mod in modules"
      :key="mod.courseCode"
      class="module-card mb-1 d-flex flex-row align-center"
    >
      <h4 style="color: rgba(255,255,255,0.9); font-size: 1.25em">
        {{ mod.courseCode }}
      </h4>
      <span 
        class="ml-2" 
        style="color: white; line-height: 1.1; font-weight: 300;"
      >{{ mod.description }}</span>
      <v-icon 
        @click="reqDeleteModule(mod.courseCode)"
        color="white"
        style="cursor: pointer; margin-left: auto;"
      >
        mdi-close
      </v-icon>
    </div>
    <div v-if="modules.length === 0">
      <span style="color: red; font-size: 1.25em">
        No modules in progress
      </span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modules: {
    type: Array,
    required: true
  }
})

const emits = defineEmits(['delete'])

const reqDeleteModule = (moduleCourseCode) => {
  emits('delete', moduleCourseCode)
}
</script>

<style scoped>
.module-card {
  background: #467ada;
  border-radius: 10px;
  padding: 10px;
  transition: 300ms;
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
}

.module-card:hover {
  background: #143875;
}
</style>