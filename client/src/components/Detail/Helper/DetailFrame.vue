<template>
  <div>
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

        <CustomFields
          input-medium="DETAIL"
          :item="item"
        />

        <EmbeddedDetail
          v-if="'embedded' in getActivePanel"
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
          <DetailInput
            :item="item"
            :input="{ type: 'textarea' }"
            prop="note"
            label="Notes"
          />
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
            @click="deleteItem({ item })"
            :disabled="readOnlyMode"
            size="large"
            color="red"
            class="mt-3"
          >
            <v-icon
              class="mr-4"
              size="x-large"
            >
              mdi-delete
            </v-icon>
            remove
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useElementSize } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useSheetManager } from '@store/useSheetManager'
import { useDocumentCache } from '@store/useDocumentCache'
import { useSyncState } from '@store/useSyncState'
import type { SheetItem } from '@apptypes/sheetItems'
import EmbeddedDetail from '../Embedded/EmbeddedDetail.vue'
import DetailInput from './DetailInput.vue'
import CustomFields from './CustomFields.vue'

onUnmounted(() => {
  const { processing } = useSyncState()
  const { itemPostedToSheet, deleteItemCache } = useDocumentCache()

  if (!processing && !itemPostedToSheet(props.item)) {
    deleteItemCache(props.item.sysId)
  }
})

const { deleteItem } = useDocumentCache()
const { getActivePanel, readOnlyMode } = storeToRefs(useSheetManager())

const sm = ref(false)
const el = ref(null)
const { width } = useElementSize(el)

watch(width, (newWidth) => {
  sm.value = newWidth < 700
}, { immediate: true })

const props = defineProps<{
  item: SheetItem
}>()
</script>