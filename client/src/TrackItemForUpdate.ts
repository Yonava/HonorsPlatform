import { useSyncState } from "./store/useSyncState";
import { useDocumentCache } from "./store/useDocumentCache";
import { watch } from "vue";
import type { Ref } from "vue";

export function useUpdateItem(item: Ref<any>) {
  const { updateItem, removeItemFromCacheBySysId } = useDocumentCache();
  const { setProcessing } = useSyncState();

  let timeout = setTimeout(() => { }, 0)
  watch(item, async (newItem, oldItem) => {
    // switch to new item
    if (newItem !== oldItem) {
      // no row # means it's a new item that has never hit the server
      if (typeof oldItem.row !== 'number') {
        const { sysId } = oldItem
        removeItemFromCacheBySysId(sysId)
      }
      return
    }
    setProcessing(true)
    clearTimeout(timeout)
    timeout = setTimeout(async () => {
      await updateItem(newItem)
    }, 2000)
  }, { deep: true })
}