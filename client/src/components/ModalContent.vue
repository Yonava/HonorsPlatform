<template>
  <div>
    <div v-if="!xs">
      <v-dialog 
        v-model="showDialog"
        width="600"
      >
        <slot></slot>
      </v-dialog>
    </div>
    <v-sheet 
      v-else-if="showDialog"
      class="xs-outer-wrapper"
      :color="bgColor"
    >
      <slot></slot>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { computed } from 'vue'

const { xs } = useDisplay()

const props = defineProps<{
  modelValue: boolean,
  bgColor?: string,
}>()

const emits = defineEmits([
  'update:modelValue'
])

const showDialog = computed({
  get: () => props.modelValue,
  set: (v) => emits('update:modelValue', v)
})
</script>

<style scoped>
.xs-outer-wrapper {
  width: 100vw; 
  height: 100vh; 
  position: fixed; 
  top: 0; 
  left: 0; 
  z-index: 10000;
}
</style>