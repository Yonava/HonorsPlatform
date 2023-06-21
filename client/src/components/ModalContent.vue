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
    <div v-else>
    <v-navigation-drawer
      v-model="showDialog"
      temporary
      touchless
      rounded
      location="bottom"
      style="width: 100%; height: 75%;"
    >
      <v-sheet
        :color="color"
        class="xs-outer-wrapper"
      >
        <slot></slot>
        <div style="margin-bottom: 25vh"></div>
      </v-sheet>
    </v-navigation-drawer>
    </div>
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