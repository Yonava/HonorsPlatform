import { ref, watch } from 'vue'
import type { Ref } from 'vue'

export type SortOptions<T> = {
  [key: string]: (a: T, b: T) => number
}

export function useSortItems<T>(items: Ref<T[]>, sortOptions: Ref<SortOptions<T>>) {

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
    console.log('sorting')
    items.value.sort(sortOptions.value[newKey])
    activeSortKey.value = newKey
  }

  return {
    setKey,
    activeSortKey,
    ascending,
  }
}