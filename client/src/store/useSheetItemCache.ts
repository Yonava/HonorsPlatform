import { defineStore } from 'pinia'
import { useDialog } from '@store/useDialog'
import { ref, computed } from 'vue'
import { initItemCache, SheetItemCache } from '@utils/sheetItemCaching'
import { SheetItem } from '@apptypes/sheetItems'
import { SheetRangeToType } from '@panels'

export const useSheetItemCache = defineStore('sheetItemCache', () => {
  const items = ref(initItemCache())

  const replaceCachedItems = <T extends keyof SheetItemCache, K extends SheetItemCache[T]>(
    cache: T,
    newItems: K
  ) => items.value[cache] = newItems

  const addItem = <T extends keyof SheetItemCache, K extends SheetRangeToType[T]>(
    cache: T,
    newItem: K
  ) => {

    items.value[cache].unshift(newItem)
  }

  const allItems = computed(() => Object.values(items.value).flat())

  const getItem = (sysId: string) => allItems.value.find(item => item.sysId === sysId)


  const debug = () => useDialog().open({
    title: 'Sheet Item Cache',
    description: JSON.stringify(items.value, null, 2)
  })

  const readonlyItems = computed(() => items.value)

  return {
    items: readonlyItems,
    allItems,
    getItem,
    debug,
    replaceCachedItems,
  }
})