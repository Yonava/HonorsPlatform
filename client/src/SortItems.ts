import { ref, computed } from 'vue'
import { useSheetManager } from './store/useSheetManager'
import { storeToRefs } from 'pinia'

export type SortOptions<T> = {
  [key: string]: (a: T, b: T) => number
}

export type PanelSortOption = {
  label: string
  func: (a: any, b: any) => number
  icon: {
    asc: string,
    desc: string
  }
}

export function useSortItems() {

  const { setItems, setSort } = useSheetManager()
  const { items, panel } = storeToRefs(useSheetManager())

  // convert PanelSortOption[] to SortOptions
  const sortOptions = computed(() => {
    const sortOptionsObject = {} as any
    panel.value.sortOptions.forEach(sort => {
      sortOptionsObject[sort.label] = sort.func
    })
    return sortOptionsObject
  })

  type SortKey = keyof typeof sortOptions | null
  const ascending = ref(true)

  const activeSortKey = ref<SortKey>(null)
  const setKey = (newKey: SortKey) => {

    if (!newKey) {
      activeSortKey.value = null
      setSort({
        func: sortOptions.value[newKey],
        ascending: ascending.value
      })
      return
    }
    if (newKey === activeSortKey.value) {
      setItems([...items.value.reverse()])
      ascending.value = !ascending.value
      setSort({
        func: sortOptions.value[newKey],
        ascending: ascending.value
      })
      return
    }
    setItems([...items.value.sort(sortOptions.value[newKey])])
    activeSortKey.value = newKey
    setSort({
      func: sortOptions.value[newKey],
      ascending: ascending.value
    })
  }

  return {
    setKey,
    activeSortKey,
    ascending,
  }
}