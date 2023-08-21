<template>
  <div>
    <div
      v-for="(headerField, index) in headerRow"
      :key="index"
    >

      <div v-if="headerField">

        <DetailInput
          v-if="inputMedium === 'DETAIL'"
          :item="item"
          :prop="index.toString()"
          :label="headerField"
        />

        <EmbeddedInput
          v-else-if="inputMedium === 'EMBEDDED'"
          :item="item"
          :prop="index.toString()"
          :label="headerField"
        />

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import EmbeddedInput from '../Embedded/EmbeddedInput.vue';
import DetailInput from './DetailInput.vue';
import { computed } from 'vue';
import { headerRowMemo } from '../../../SheetsAPI';
import { useSheetManager } from '../../../store/useSheetManager';
import { storeToRefs } from 'pinia';
import type { SheetItem } from '../../../SheetTypes';
import { getNonCustomHeaderCount } from '../../../DataMappers';

const sheetManager = useSheetManager()
const { getActivePanel } = storeToRefs(sheetManager)

const headerRow = computed(() => {
  const { sheetRange } = getActivePanel.value
  const nonCustomHeaderCount = getNonCustomHeaderCount()
  return headerRowMemo[sheetRange]?.slice(nonCustomHeaderCount) ?? []
})

const props = defineProps<{
  inputMedium: 'DETAIL' | 'EMBEDDED',
  item: SheetItem
}>()
</script>