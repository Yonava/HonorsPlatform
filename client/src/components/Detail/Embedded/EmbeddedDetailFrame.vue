<template>
  <ModalContent
    v-model="showDialog"
  >
    <div class="d-flex justify-center align-center">
      <v-card
        :width="xs ? '100%' : '550'"
        class="pa-5"
        elevation="0"
      >

        <div
          v-if="xs"
          class="d-flex flex-row justify-center align-center mb-5"
        >
          <slot name="close-button">
            <v-btn
              @click="showDialog = false"
              color="red"
              variant="outlined"
            >
              close
            </v-btn>
          </slot>
          <v-spacer></v-spacer>
          <slot name="right-button"></slot>
        </div>

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

        <v-divider></v-divider>

        <div
          :style="{
            maxHeight: xs ? '' : 'calc(100vh - 500px)',
            overflow: 'auto',
          }"
          class="pt-4"
        >

          <slot></slot>

          <CustomFields
            v-if="focusedEmbeddedItem"
            :item="focusedEmbeddedItem"
            input-medium="EMBEDDED"
          />

          <EmbeddedInput
            v-if="focusedEmbeddedItem"
            :item="focusedEmbeddedItem"
            prop="note"
            :input="{
              type: 'textarea',
            }"
            label="Note"
          />

        </div>

        <v-card-actions
          v-if="!xs"
          class="pa-0"
        >

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
import CustomFields from '../Helper/CustomFields.vue'
import EmbeddedInput from './EmbeddedInput.vue'
import ModalContent from '../../ModalContent.vue'
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDisplay } from 'vuetify'
import { useDocumentCache } from '@store/useDocumentCache'
import { useSyncState } from '@store/useSyncState'
import { useSheetManager } from '@store/useSheetManager'

const cleanup = () => {

  if (!focusedEmbeddedItem.value) {
    return
  }

  const { processing } = useSyncState()
  const { itemPostedToSheet, deleteItemCache } = useDocumentCache()

  if (!processing && !itemPostedToSheet(focusedEmbeddedItem.value)) {
    deleteItemCache(focusedEmbeddedItem.value.sysId, getActiveEmbeddedPanel.value.panelName)
  }

  setFocusedEmbeddedItem(null)
}

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

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void,
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
      cleanup()
      dialogCanOpen.value = true
    }, 300)
  }
})
</script>