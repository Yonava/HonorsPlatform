<template>
  <v-navigation-drawer
    v-if="smAndDown"
    v-model="showItem"
    temporary
    touchless
    rounded
    location="bottom"
    style="width: 100%; height: calc(100vh - 175px);"
  >
    <component
      v-if="item"
      :is="getActivePanel.components.detail"
      :item="item"
    />
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useDisplay } from 'vuetify';
import { useSheetManager } from '@store/useSheetManager';
import { useDocumentCache } from '@store/useDocumentCache';

const { getActivePanel, focusedItemSysId } = storeToRefs(useSheetManager())
const { getSelectedItems, setSelectedItems } = useDocumentCache()

const { smAndDown } = useDisplay()

watch(getActivePanel, () => {
  canShowItem.value = false
  setTimeout(() => {
    canShowItem.value = true
  }, 300)
})

const canShowItem = ref(true)

const showItem = computed({
  get: () => {
    return !!item.value && canShowItem.value
  },
  set: (value) => {
    if (!value) {
      setSelectedItems({
        items: [],
      })
    }
  }
})

const item = computed(() => {
  const selectedItems = getSelectedItems()
  return selectedItems.find((item) => item.sysId === focusedItemSysId.value)
})
</script>