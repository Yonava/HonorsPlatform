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

export function useChangeWatcher(item: Ref<SheetItem>) {
  let changeWatcher = () => {};
  const upToDate = ref(false)

  const changed = (newVal: Object, oldVal: Object) => {
    return JSON.stringify(newVal) !== JSON.stringify(oldVal)
  }

  watch(item, (newVal, oldVal) => {
    if (!changed(newVal, oldVal)) return
    upToDate.value = false
  })

  watch(upToDate, (val) => {
    if (val) {
      changeWatcher = watch(item, () => {
        upToDate.value = false
      }, { deep: true })
    } else {
      changeWatcher()
    }
  })

  return {
    upToDate
  }
}