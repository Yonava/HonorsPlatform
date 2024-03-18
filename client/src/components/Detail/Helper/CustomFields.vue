<template>
  <div>
    <div
      v-for="(headerField, index) in headerRow"
      :key="index"
    >

      <div v-if="headerField && index > nonCustomPropLength - 1">

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
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSheetManager } from '@store/useSheetManager';
import type { SheetItem } from '@apptypes/sheetItems';
import EmbeddedInput from '../Embedded/EmbeddedInput.vue';
import DetailInput from './DetailInput.vue';
import { headerRowMemo } from '../../../SheetsAPI';
import { getNonCustomProps } from '@data/DataMappers';

const sheetManager = useSheetManager()
const { getActivePanel, getActiveEmbeddedPanel } = storeToRefs(sheetManager)

const headerRow = computed(() => {
  if (props.inputMedium === 'DETAIL') {
    const { sheetRange } = getActivePanel.value
    return headerRowMemo[sheetRange] ?? []
  } else if (props.inputMedium === 'EMBEDDED') {
    const { sheetRange } = getActiveEmbeddedPanel.value
    return headerRowMemo[sheetRange] ?? []
  } else {
    return []
  }
})

const nonCustomPropLength = computed(() => {
  if (props.inputMedium === 'DETAIL') {
    const { panelName } = getActivePanel.value
    const nonCustomProps = getNonCustomProps(panelName)
    return nonCustomProps.length
  } else if (props.inputMedium === 'EMBEDDED') {
    const { panelName } = getActiveEmbeddedPanel.value
    const nonCustomProps = getNonCustomProps(panelName)
    return nonCustomProps.length
  } else {
    return 0
  }
})

const props = defineProps<{
  inputMedium: 'DETAIL' | 'EMBEDDED',
  item: SheetItem
}>()
</script>