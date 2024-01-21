<template>
  <ModalContent v-model="showDialog">
    <component
      v-if="componentInstance"
      :is="componentInstance.component"
      v-bind="componentInstance.props"
    />
    <DefaultDialogContent
      v-else-if="contentInstance"
      :title="contentInstance.title"
      :description="contentInstance.description"
      :buttons="contentInstance.buttons"
    />
  </ModalContent>
</template>

<script setup lang="ts">
import ModalContent from './components/ModalContent.vue'
import DefaultDialogContent from './components/DefaultDialogContent.vue'
import { useDialog } from './store/useDialog'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

const dialogState = useDialog()
const { close } = dialogState
const { show, instance } = storeToRefs(dialogState)

const componentInstance = computed(() => {
  if (!instance.value) return
  if ('component' in instance.value) return instance.value
})

const contentInstance = computed(() => {
  if (!instance.value) return
  if ('component' in instance.value) return
  return instance.value
})

const showDialog = computed({
  get: () => show.value,
  set: () => {
    if (instance.value?.persistent) return
    close()
  }
})
</script>