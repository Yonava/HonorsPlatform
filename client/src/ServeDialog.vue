<template>
  <ModalContent
    v-model="showDialog"
  >
    <component
      v-if="component"
      :is="component.render"
      :props="component.props"
    />
    <DefaultDialogContent
      v-else
      :body="body"
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
const { show, component, body, persistent } = storeToRefs(dialogState)

const showDialog = computed({
  get: () => show.value,
  set: () => {
    if (persistent.value) {
      return
    }
    close()
  }
})
</script>