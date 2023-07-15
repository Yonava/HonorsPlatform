<template>
  <div @click="useSheetManager().focusedItem = item">
    <div
      ref="el"
      :class="[
        'pa-5',
        'd-flex',
        sm ? 'flex-column' : 'flex-row'
      ]"
    >
      <div>
        <slot name="main"></slot>
        <EmbeddedDetail
          v-if="getActivePanel.embedded"
          :item="item"
        />
      </div>
      <v-divider
        v-if="sm"
        class="my-2"
      ></v-divider>
      <div
        :class="[
          sm ? '' : 'ml-5',
          'd-flex',
          'flex-column',
          'align-center'
        ]"
        :style="sm ? '' : 'width: 55%; max-width: 450px'"
      >
        <div style="width: 100%;">
          <slot name="notes-button"></slot>
          <v-textarea
            v-model="notepad"
            auto-grow
            variant="outlined"
            clearable
            label="Notes"
          ></v-textarea>
        </div>
        <div
          :class="[
            'd-flex',
            'flex-column'
          ]"
          style="width: 100%"
        >
          <slot name="buttons"></slot>
          <v-btn
            @click="attemptDelete"
            size="large"
            color="red"
            class="mt-3"
          >
            <v-icon
              class="mr-4"
              size="x-large"
            >mdi-delete</v-icon>
            remove
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import EmbeddedDetail from '../Embedded/EmbeddedDetail.vue'
import { computed, ref, watch } from 'vue'
import { useElementSize } from '@vueuse/core'
import { useSheetManager } from '../../../store/useSheetManager'
import { useDialog } from '../../../store/useDialog'
import { useDocumentCache } from '../../../store/useDocumentCache'
import { storeToRefs } from 'pinia'
import { SheetItem } from '../../../SheetTypes'

const { open, close } = useDialog()
const { deleteItem, removeSelectedItem } = useDocumentCache()
const { getActivePanel } = storeToRefs(useSheetManager())

const sm = ref(false)
const el = ref(null)
const { width } = useElementSize(el)

watch(width, (newWidth) => {
  sm.value = newWidth < 700
}, { immediate: true })

const props = defineProps<{
  modelValue: string,
  item: SheetItem,
  disableDelete?: boolean,
  disableReason?: string,
}>()

// @ts-ignore
const emits = defineEmits<{
  'update:modelValue': (value: string) => void,
}>()

const notepad = computed({
  get: () => props.modelValue,
  set: (value) => {
    // @ts-ignore
    emits('update:modelValue', value)
  }
})

const attemptDelete = () => {
  if (props.disableDelete) {
    open({
      body: {
        title: 'Cannot Delete',
        description: props.disableReason,
        buttons: [
          {
            text: 'ok',
            color: `${getActivePanel.value.color}-darken-2`,
            onClick: close
          }
        ]
      }
    })
    return
  }
  deleteItem({
    item: props.item,
  })
}
</script>