import { watch, ref, computed } from 'vue'
import type { Ref } from 'vue'

export function useIncrementalRender<T>(items: Ref<T[]>, renderInterval = 10) {
  const itemsToDisplay = ref(items.value.length)

  let updateInterval = setInterval(() => {}, 0);
  watch(items, () => {
    if (itemsToDisplay.value !== items.value.length) {
      clearInterval(updateInterval)
      updateInterval = setInterval(() => {
        if (itemsToDisplay.value === items.value.length) {
          clearInterval(updateInterval)
          return
        }
        else if (itemsToDisplay.value > items.value.length) {
          itemsToDisplay.value = items.value.length
        }
        else if (itemsToDisplay.value < items.value.length) {
          itemsToDisplay.value++
        }
      }, renderInterval)
    }
  })

  const incrementallyRenderedItems = computed(() => items.value.slice(0, itemsToDisplay.value))

  return {
    incrementallyRenderedItems,
  }
}