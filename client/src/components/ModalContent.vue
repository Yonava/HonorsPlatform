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
      :color="color"
    >
      <slot></slot>
      <div style="margin-bottom: 18vh"></div>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const { xs } = useDisplay()

const props = defineProps<{
  modelValue: boolean,
  bgColor?: string,
}>()

const color = computed(() => props.bgColor || 'white')
const router = useRouter()

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
  overflow: auto;
  top: 0; 
  left: 0; 
  z-index: 10000;
}
</style>