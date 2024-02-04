import { defineStore } from 'pinia'
import { useDialog } from '@store/useDialog'
import { ref, computed } from 'vue'
import { panels, type PanelRange } from '@panels'
import { initItemCache, SheetItemCache } from '@utils/sheetItemCaching'

export const useSheetItemCache = defineStore('sheetItemCache', () => {
  const items = ref(initItemCache())

  const replaceCachedItems = <T extends keyof SheetItemCache, K extends SheetItemCache[T]>(
    cache: T,
    newItems: K
  ) => items.value[cache] = newItems

  const debug = () => useDialog().open({
    title: 'Sheet Item Cache',
    description: JSON.stringify(items.value, null, 2)
  })

  return {
    items,
    debug,
    replaceCachedItems,
  }
})