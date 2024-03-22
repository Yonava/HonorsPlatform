import { computed, toRef } from "vue"
import type { MaybeRefOrGetter } from "vue"
import { storeToRefs } from "pinia"
import { useSheetManager } from "@store/useSheetManager"
import { useDocumentCache } from "@store/useDocumentCache"
import type { PanelName, PanelToSheetType } from "@panels"
import type { SheetItem } from "@apptypes/sheetItems"

export type SidebarAction = {
  icon: (isHovered: boolean) => string,
  tooltip: string,
  onClick: (...args: any) => void,
  disableInReadOnlyMode?: boolean,
  actionId: string
}

export type SidebarActionFunction<T extends SheetItem = SheetItem> = (item: T) => SidebarAction | undefined

export type PanelSpecificSidebarAction = {
  [K in PanelName]: SidebarActionFunction<PanelToSheetType[K]>
}

export function useSidebarActions<T extends SheetItem, K extends PanelSpecificSidebarAction>(
  itemInput: MaybeRefOrGetter<T>,
  panelSpecificActions: K
) {

  const item = toRef(itemInput)

  const { deleteItem } = useDocumentCache()
  const { getActivePanel, readOnlyMode } = storeToRefs(useSheetManager())

  const togglePin = () => {
    const { removePinnedItem: remove, addPinnedItem: add } = useSheetManager()
    isPinned.value ? remove(item.value) : add(item.value)
  }

  const isPinned = computed(() => {
    return !!useSheetManager().getPinnedItem(item.value)
  })

  const defaultActions = {
    pin: () => ({
      icon: (isHovered: boolean) => isHovered || isPinned.value ? 'mdi-pin' : 'mdi-pin-outline',
      tooltip: isPinned.value ? 'Unpin' : 'Pin',
      onClick: togglePin,
      actionId: "pin"
    }),
    delete: () => ({
      icon: (isHovered: boolean) => isHovered ? 'mdi-delete' : 'mdi-delete-outline',
      tooltip: 'Delete',
      onClick: () => deleteItem({ item: item.value }),
      disableInReadOnlyMode: true,
      actionId: 'delete'
    })
  } as const


  return computed(() => {
    const panelSpecificAction = panelSpecificActions[getActivePanel.value.panelName]
    const actionFns = [defaultActions.pin, panelSpecificAction, defaultActions.delete]

    const actionFilter = (action: SidebarAction) => {
      if (!action) return false
      if (action.disableInReadOnlyMode && readOnlyMode.value) return false
      return true
    }

    const actions = actionFns.map((actionFn) => actionFn(item.value as any)) as SidebarAction[]
    return actions.filter(actionFilter)
  })
}