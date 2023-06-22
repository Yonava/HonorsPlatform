import { useSyncState } from "./store/useSyncState";
import { storeToRefs } from "pinia";
import { useDocumentCache } from "./store/useDocumentCache";
import { useSheetManager } from "./store/useSheetManager";
import { watch } from "vue";
import type { Ref } from "vue";
import type { SheetItem } from "./SheetTypes";

export function useUpdateItem(item: Ref<SheetItem>, panelObject?: any) {
  const { updateItem, removeItemFromCacheBySysId } = useDocumentCache();
  const { setProcessing } = useSyncState();
  const { processing } = storeToRefs(useSyncState());
  const { getActivePanel } = storeToRefs(useSheetManager());

  const panel = panelObject ?? getActivePanel.value

  let timeout = setTimeout(() => { }, 0)
  watch(item, async (newItem, oldItem) => {
    // switch to new item
    if (newItem !== oldItem) {

      if (processing.value) {
        updateItem(oldItem, panel)
        clearTimeout(timeout)
      }
      // no row # means it's a new item that has never hit the server
      if (typeof oldItem.row !== 'number') {
        const { sysId } = oldItem
        removeItemFromCacheBySysId(sysId)
      }
      return
    }
    setProcessing(true)
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      updateItem(newItem, panel)
    }, 2000);
  }, { deep: true })
}