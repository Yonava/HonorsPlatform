import { useSyncState } from "./store/useSyncState";
import { storeToRefs } from "pinia";
import { useDocumentCache } from "./store/useDocumentCache";
import { useSheetManager } from "./store/useSheetManager";
import { useAuth } from "./store/useAuth";
import { watch, onUnmounted } from "vue";
import type { Ref } from "vue";
import type { SheetItem } from "./SheetTypes";
import type { Panel } from "./Panels";

const updateDebounceMs = 2_000

export function useUpdateItem(item: Ref<SheetItem>, panelObject?: Panel) {
  const { updateItem, deleteItemCache } = useDocumentCache();
  const { setProcessing } = useSyncState();
  const { processing } = storeToRefs(useSyncState());
  const { getActivePanel } = storeToRefs(useSheetManager());

  const panel = panelObject ?? getActivePanel.value

  let timeout = setTimeout(() => { }, 0)
  let currentItem = ''
  let updateInProgress = false;

  watch(item, async (newItem, oldItem) => {

    // const { socket } = useAuth()
    // if (newItem) {
    //   socket.emit('userAction', {
    //     action: 'update',
    //     payload: {
    //       item: newItem,
    //       panelName: panel.panelName
    //     }
    //   })
    // }

    if (updateInProgress) {
      return
    }

    // user has reverted the item back to its original state
    if (JSON.stringify(newItem) === currentItem) {
      clearTimeout(timeout)
      setProcessing(false)
      return
    }

    // user just selected this item
    if (!oldItem) {
      currentItem = JSON.stringify(newItem)
      return
    }

    if (newItem !== oldItem) {
      // no row # means it's a new item that has never hit the server
      if (oldItem && typeof oldItem?.row !== 'number' && !processing.value) {
        const { sysId } = oldItem
        deleteItemCache(sysId, panel)
      }
      return
    }

    setProcessing(true)
    clearTimeout(timeout)

    timeout = setTimeout(async () => {
      updateInProgress = true
      await updateItem({
        item: newItem,
        panel,
      })
      updateInProgress = false
      currentItem = JSON.stringify(newItem)
    }, updateDebounceMs);
  }, { deep: true, immediate: true })

  onUnmounted(() => {
    // no row # means it's a new item that has never hit the server
    if (item.value && typeof item.value?.row !== 'number' && !processing.value) {
      const { sysId } = item.value
      deleteItemCache(sysId, panel)
    }
  })

  const forceUpdate = () => {
    updateItem({
      item: item.value,
      panel,
    })
  }

  return {
    forceUpdate
  }
}