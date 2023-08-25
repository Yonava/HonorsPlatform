<template>
  <div>
    <div v-if="!xs">
      <v-dialog
        v-model="showDialog"
        :persistent="persistent && show"
        width="600"
      >
        <slot></slot>
      </v-dialog>
    </div>
    <div v-else>
      <v-navigation-drawer
        v-model="showNavDrawer"
        touchless
        rounded
        location="bottom"
        style="width: 100%; height: calc(100vh - 175px);"
      >
        <v-sheet
          :color="color"
          class="xs-outer-wrapper"
        >
          <slot></slot>
          <div style="margin-bottom: 175px"></div>
        </v-sheet>
      </v-navigation-drawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { computed, ref, watchEffect, watch } from 'vue'
import { useDialog } from '../store/useDialog';
import { storeToRefs } from 'pinia';

const { close } = useDialog()
const { persistent, show } = storeToRefs(useDialog())

const { xs } = useDisplay()

const props = defineProps<{
  modelValue: boolean,
  bgColor?: string,
}>()

const color = computed(() => props.bgColor || 'white')

const emits = defineEmits([
  'update:modelValue'
])

const showDialog = computed({
  get: () => props.modelValue,
  set: (v) => {
    emits('update:modelValue', v)
  }
})

const showNavDrawer = ref(false)
watchEffect(() => {
  if (showDialog.value) {
    setTimeout(() => {
      showNavDrawer.value = true
    }, 100)
  } else {
    showNavDrawer.value = false
  }
})

watch(showNavDrawer, (v) => {
  if (!v) {
    close()
  }
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