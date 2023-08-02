import { useSyncState } from "./store/useSyncState";
import { storeToRefs } from "pinia";
import { useDocumentCache } from "./store/useDocumentCache";
import { useSheetManager } from "./store/useSheetManager";
import { useAuth } from "./store/useAuth";
import { type Ref, watch, onUnmounted, computed } from "vue";
import type { SheetItem } from "./SheetTypes";
import { type PanelName, panels } from "./Panels";

const updateDebounceMs = 2_000

export function useUpdateItem<T extends SheetItem>(item: Ref<T | null>, panelNameParam?: PanelName) {
  const { updateItem, deleteItemCache, itemPostedToSheet } = useDocumentCache();
  const { setProcessing } = useSyncState();
  const { processing } = storeToRefs(useSyncState());
  const { getActivePanel } = storeToRefs(useSheetManager());
  const { connectedAccounts, focusData } = storeToRefs(useAuth())

  const panelName = panelNameParam ?? getActivePanel.value.panelName
  const panel = panels[panelName]

  let timeout = setTimeout(() => { }, 0)
  let currentItem = ''

  const update = (newItem: T | null, oldItem: T | null | undefined) => {

    // collab mode takes over
    if (numberOfUsersEditingItem.value > 1) {
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

    if (newItem !== oldItem && !itemPostedToSheet(oldItem) && !processing.value) {
      const { sysId } = oldItem
      deleteItemCache(sysId, panelName)
      return
    }

    if (!newItem) {
      return
    }

    setProcessing(true)
    clearTimeout(timeout)

    timeout = setTimeout(async () => {
      currentItem = JSON.stringify(newItem)
      await updateItem({
        item: newItem,
        panelName,
      })
    }, updateDebounceMs);
  }

  const numberOfUsersEditingItem = computed(() => {
    if (!item.value) {
      return 0
    }
    const { sysId } = item.value
    let accountsEditingItem = 0
    for (const account of connectedAccounts.value) {
      const dataForAccount = focusData.value[account.socketId]
      if (!dataForAccount) {
        continue
      }
      if (dataForAccount.sysId === sysId || dataForAccount.embeddedSysId === sysId) {
        accountsEditingItem++
      }
    }
    return accountsEditingItem
  })

  watch(numberOfUsersEditingItem, (newNumber, oldNumber) => {
    const exitCollabMode = newNumber === 1 && newNumber < oldNumber
    if (exitCollabMode) {
      forceUpdate()
    }
  })

  watch(item, async (newItem, oldItem) => {
    update(newItem, oldItem)
  }, { deep: true, immediate: true })

  onUnmounted(() => {
    if (!item.value) {
      return
    }

    if (!itemPostedToSheet(item.value) && !processing.value) {
      const { sysId } = item.value
      deleteItemCache(sysId, panelName)
    }
  })

  const forceUpdate = async () => {
    if (!item.value) {
      return
    }

    currentItem = JSON.stringify(item.value)
    await updateItem({
      item: item.value,
      panelName,
    })
  }

  type Primitive = string | number | boolean

  const broadcastThroughSocket = (property: keyof T, value?: Primitive) => {
    if (!item.value) {
      return
    }

    const { socket } = useAuth()
    socket.emit('userAction', {
      action: 'prop-update',
      payload: {
        panelName: panel.panelName,
        sysId: item.value.sysId,
        value: value ?? item.value[property],
        prop: property,
      }
    })
  }

  return {
    numberOfUsersEditingItem,
    forceUpdate,
    broadcastThroughSocket
  }
}