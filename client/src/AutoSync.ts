import { onUnmounted, watch, ref, inject } from "vue";
import type { Ref } from "vue";
import { SheetItem } from "./SheetTypes";

const syncIntervalDefault = 3000;

export function useAutoSync(
  sync: () => Promise<void>, 
  syncInterval: number = syncIntervalDefault
) {
  const autoSync = inject("autoSync") as Ref<boolean>;

  const interval = setInterval(() => {
    if (autoSync.value) {
      sync();
    }
  }, syncInterval);

  onUnmounted(() => {
    clearInterval(interval);
  });
}

export function useChangeWatcher(key: () => Ref<SheetItem>) {
  const upToDate = ref(false)
  const lastItem = ref<SheetItem | null>(null)

  const changed = (newVal: Object, oldVal: Object) => {
    return JSON.stringify(newVal) !== JSON.stringify(oldVal)
  }

  watch(key, item => {
    if (item.value.row !== lastItem.value?.row) {
      if (lastItem.value) upToDate.value = false
      lastItem.value = JSON.parse(JSON.stringify(item.value))
      return 
    }
    upToDate.value = !changed(item.value, lastItem.value as SheetItem)
    lastItem.value = JSON.parse(JSON.stringify(item.value))
  }, { 
    deep: true, 
    immediate: true 
  })

  return {
    upToDate
  }
}