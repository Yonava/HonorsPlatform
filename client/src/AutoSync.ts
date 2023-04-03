import { onUnmounted, watch, ref, inject } from "vue";
import type { Ref } from "vue";
import { SheetItem } from "./SheetTypes";

const syncIntervalDefault = 3000;
const selectedItem = inject("selectedItem") as Ref<SheetItem>;

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

export function useChangeWatcher(item: Ref<SheetItem> = selectedItem) {
  let changeWatcher = () => {};
  const upToDate = ref(false)

  watch(item, () => {
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