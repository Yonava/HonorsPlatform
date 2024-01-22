<template>
  <ModalContent
    v-model="showDialog"
    :persistent="persistent"
  >
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
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDialog } from '@store/useDialog'
import ModalContent from './components/ModalContent.vue'
import DefaultDialogContent from './components/DefaultDialogContent.vue'

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

const persistent = computed(() => {
  if (!instance.value) return false
  return instance.value.persistent
})

const showDialog = computed({
  get: () => show.value,
  set: () => {
    if (instance.value?.persistent) return
    close({
      resolveWith: 'BACKGROUND_CLOSE'
    })
  }
})
</script>