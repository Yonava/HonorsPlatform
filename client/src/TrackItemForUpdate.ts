import { storeToRefs } from "pinia";
import { useSheetManager } from "./store/useSheetManager";
import { type Ref } from "vue";
import type { SheetItem } from "./SheetTypes";
import { type PanelName } from "./Panels";
import { useSocket } from "./store/useSocket";

export function useUpdateItem<T extends SheetItem>(item: Ref<T | null>, panelNameParam?: PanelName) {
  const { getActivePanel } = storeToRefs(useSheetManager());
  const panelName = panelNameParam ?? getActivePanel.value.panelName

  type Primitive = string | number | boolean

  const broadcastThroughSocket = (property: keyof T, value?: Primitive) => {
    if (!item.value) {
      return
    }

    const { emitUserAction } = useSocket()
    emitUserAction({
      action: 'prop-update',
      payload: {
        sysId: item.value.sysId,
        prop: property,
        value: value ?? item.value[property],
        panelName,
      }
    })
  }

  return {
    broadcastThroughSocket
  }
}

export function useBroadcastThroughSocket(itemType: 'DETAIL' | 'EMBEDDED') {
  const { emitUserAction } = useSocket()
  const {
    getActivePanel,
    getActiveEmbeddedPanel,
    focusedEmbeddedItem,
    getFocusedItem,
  } = storeToRefs(useSheetManager());

  const detailMode = itemType === 'DETAIL'
  const panelName = detailMode ? getActivePanel.value.panelName : getActiveEmbeddedPanel.value.panelName

  const broadcast = (prop: string) => {
    const item = detailMode ? getFocusedItem.value : focusedEmbeddedItem.value

    if (!item) {
      console.error('no item')
      return
    }

    // check if prop is a key of item
    if (!(prop in item)) {
      console.error('prop not in item')
      return
    }

    const value = item[prop as keyof typeof item]
    const { sysId } = item

    emitUserAction({
      action: 'prop-update',
      payload: {
        sysId,
        prop,
        value,
        panelName,
      }
    })
  }

  return {
    broadcast
  }
}