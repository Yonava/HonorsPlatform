import { onUnmounted, watch, ref, inject, computed } from "vue";
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

  const changed = (newVal: Object, oldVal: Object) => {
    for (const key in newVal) {
      if (typeof newVal[key] === 'object') {
        if (changed(newVal[key], oldVal[key] || {})) {
          return true
        }
      }
      if (newVal[key] !== oldVal[key]) {
        return true
      }
    }
    return false
  }

  watch(key, (newItem, oldItem) => {
    if (newItem.value.row !== oldItem?.value.row) {
      return upToDate.value = false
    }
    upToDate.value = changed(newItem.value, oldItem.value || {})
  }, { deep: true })

  return {
    upToDate
  }
}