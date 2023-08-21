<template>
  <ModalContent v-model="showDialog">
    <div class="d-flex justify-center align-center">
      <v-card
        class="pa-5"
        :width="xs ? '100%' : '550'"
        elevation="0"
      >
        <v-sheet
          :color="getActiveEmbeddedPanel.color + '-darken-2'"
          class="py-2 px-4 d-flex align-center"
          style="font-weight: bold; color: white; border-radius: 20px; width: 120%"
        >
          <v-icon class="mr-2">
            {{ getActiveEmbeddedPanel.icon }}
          </v-icon>
          <span>
            {{ getActiveEmbeddedPanel.title.singular }}
          </span>
        </v-sheet>
        <EmbeddedInput
          v-if="focusedEmbeddedItem"
          :item="focusedEmbeddedItem"
          :placeholder="titlePlaceholder"
          :prop="getActiveEmbeddedPanel.properties.title"
          :input="{
            type: 'title-variant'
          }"
        />
        <slot></slot>

        <EmbeddedInput
          v-if="focusedEmbeddedItem"
          :item="focusedEmbeddedItem"
          prop="note"
          :input="{
            type: 'textarea',
          }"
          label="Note"
        />

        <v-card-actions class="pa-0">
          <v-btn
            @click="showDialog = false"
            color="red"
            variant="outlined"
          >
            close
          </v-btn>
          <v-spacer></v-spacer>
          <slot name="right-button"></slot>
        </v-card-actions>
      </v-card>
    </div>
  </ModalContent>
</template>

<script setup lang="ts">
import EmbeddedInput from './EmbeddedInput.vue'
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDisplay } from 'vuetify'
import { useSheetManager } from '../../../store/useSheetManager'
import ModalContent from '../../ModalContent.vue'

const {
  getActiveEmbeddedPanel,
  focusedEmbeddedItem
} = storeToRefs(useSheetManager())

const {
  setFocusedEmbeddedItem
} = useSheetManager()

const props = defineProps<{
  titlePlaceholder: string
}>()

// @ts-ignore
const emits = defineEmits<{
  'update:modelValue': (value: string) => void,
}>()

const { xs } = useDisplay()

const dialogCanOpen = ref(true)
const showDialog = computed({
  get: () => {
    return dialogCanOpen.value && !!focusedEmbeddedItem.value
  },
  set: () => {
    dialogCanOpen.value = false
    setTimeout(() => {
      setFocusedEmbeddedItem(null)
      dialogCanOpen.value = true
    }, 300)
  }
})
</script>