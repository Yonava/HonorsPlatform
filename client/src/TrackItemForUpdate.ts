import { useSyncState } from "./store/useSyncState";
import { storeToRefs } from "pinia";
import { useDocumentCache } from "./store/useDocumentCache";
import { useSheetManager } from "./store/useSheetManager";
import { watch } from "vue";
import type { Ref } from "vue";
import type { SheetItem } from "./SheetTypes";
import type { Panel } from "./Panels";

const updateDebounceMs = 2_000

export function useUpdateItem(item: Ref<SheetItem>, panelObject?: Panel) {
  const { updateItem, removeItemFromCacheBySysId } = useDocumentCache();
  const { setProcessing } = useSyncState();
  const { processing } = storeToRefs(useSyncState());
  const { getActivePanel } = storeToRefs(useSheetManager());

  const panel = panelObject ?? getActivePanel.value

  let timeout = setTimeout(() => { }, 0)
  let currentItem = ''
  watch(item, async (newItem, oldItem) => {

    // user has reverted the item back to its original state
    if (JSON.stringify(newItem) === currentItem) {
      clearTimeout(timeout)
      setProcessing(false)
      return
    }

    // indicates that the sheet item has changed
    if (newItem !== oldItem) {

      currentItem = JSON.stringify(newItem)

      // there is still an item in transit, update it immediately
      if (processing.value) {
        updateItem({
          item: oldItem,
          panel,
        })
        clearTimeout(timeout)
      }

      // no row # means it's a new item that has never hit the server
      if (oldItem && typeof oldItem?.row !== 'number' && !processing.value) {
        const { sysId } = oldItem
        removeItemFromCacheBySysId(sysId, panel)
      }

    // new item is the same sheet item as the old item, indicate it is processing and wait for 2 seconds to see if more changes come in
    } else {
      setProcessing(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        updateItem({
          item: newItem,
          panel,
        })
        currentItem = JSON.stringify(newItem)
      }, updateDebounceMs);
    }
  }, { deep: true, immediate: true })
}