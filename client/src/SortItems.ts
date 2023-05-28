import { ref } from 'vue'
import type { Ref } from 'vue'
import { useSheetManager } from './store/useSheetManager'

export type SortOptions<T> = {
  [key: string]: (a: T, b: T) => number
}

export function useSortItems<T>(items: Ref<T[]>, sortOptions: Ref<SortOptions<T>>) {

  const { setPinnedItem } = useSheetManager()

  type SortKey = keyof typeof sortOptions | null
  const ascending = ref(false)

  const activeSortKey = ref<SortKey>(null)
  const setKey = (newKey: SortKey) => {
    if (!newKey) {
      activeSortKey.value = null
      return
    }
    if (newKey === activeSortKey.value) {
      items.value.reverse()
      ascending.value = !ascending.value
      return
    }
    items.value.sort(sortOptions.value[newKey])
    setPinnedItem(null)
    activeSortKey.value = newKey
  }

  return {
    setKey,
    activeSortKey,
    ascending,
  }
}