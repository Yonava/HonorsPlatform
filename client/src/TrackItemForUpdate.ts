import { useSheetManager } from "./store/useSheetManager";
import { useSyncState } from "./store/useSyncState";
import { watch } from "vue";
import type { Ref } from "vue";

export function useUpdateItem(item: Ref<any>) {
  const { updateItem } = useSheetManager();
  const { setProcessing } = useSyncState();

  let timeout = setTimeout(() => { }, 0)
  watch(item, (newItem, oldItem) => {
    if (newItem !== oldItem) {
      return
    }
    setProcessing(true)
    clearTimeout(timeout)
    timeout = setTimeout(async () => {
      await updateItem(newItem)
    }, 2000)
  }, { deep: true })
}