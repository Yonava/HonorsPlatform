import { computed } from "vue"
import { storeToRefs } from "pinia"
import { useSheetManager } from "@store/useSheetManager"
import { useDocumentCache } from "@store/useDocumentCache"
import type { PanelName, PanelToSheetType } from "@panels"
import type { SheetItem } from "@apptypes/sheetItems"

export type SidebarAction = {
  /**
   * Function to determine the icon for the action based on whether it is hovered or not.
   * @param isHovered Indicates whether the action is being hovered over.
   * @returns The icon string.
   */
  icon: (isHovered: boolean) => string,
  /**
   * Tooltip text for the action.
   */
  tooltip: string,
  /**
   * Callback function to be executed when the action is clicked.
   * @param ev The click event.
   */
  onClick: (ev: MouseEvent) => void,
  /**
   * Flag indicating whether the action should be disabled in read-only mode.
   */
  disableInReadOnlyMode?: boolean,
  /**
   * Unique identifier for the action.
   */
  actionId: string
}

/**
 * Represents a sidebar action generating function that takes a sheet item and returns a sidebar action.
 * if the action cannot be performed on the item, it should return undefined so that it can be filtered out.
 * @template T The type of the sheet item.
 */
export type SidebarActionFunction<T extends SheetItem = SheetItem> = (item: T) => SidebarAction | undefined

export type PanelSpecificSidebarAction = {
  [K in PanelName]: SidebarActionFunction<PanelToSheetType[K]>
}

/**
 * Hook for managing sidebar actions on panel list items.
 * @template T The type of the sheet item.
 * @template K The type of panel-specific sidebar actions.
 * @param itemInput The sheet item to which the sidebar actions apply.
 * @param panelSpecificActions Panel-specific sidebar actions.
 * @returns Computed property representing all active/valid sidebar actions.
*/
export function useSidebarActions<T extends SheetItem, K extends PanelSpecificSidebarAction>(
  item: T,
  panelSpecificActions: K
) {

  const { deleteItem } = useDocumentCache()
  const { getPinnedItem, removePinnedItem, addPinnedItem } = useSheetManager()
  const { getActivePanel, readOnlyMode } = storeToRefs(useSheetManager())

  const togglePin = () => isPinned.value ? removePinnedItem(item) : addPinnedItem(item)
  const isPinned = computed(() => !!getPinnedItem(item))

  const defaultActions = {
    pin: () => ({
      icon: (isHovered: boolean) => isHovered || isPinned.value ? 'mdi-pin' : 'mdi-pin-outline',
      tooltip: isPinned.value ? 'Unpin' : 'Pin',
      onClick: togglePin,
      actionId: "pin"
    } as const),
    delete: () => ({
      icon: (isHovered: boolean) => isHovered ? 'mdi-delete' : 'mdi-delete-outline',
      tooltip: 'Delete',
      onClick: () => deleteItem({ item }),
      disableInReadOnlyMode: true,
      actionId: 'delete'
    } as const)
  } as const

  return computed(() => {
    const panelSpecificAction = panelSpecificActions[getActivePanel.value.panelName]
    const actionGeneratingFns = [defaultActions.pin, panelSpecificAction, defaultActions.delete]

    const actionFilter = (action: ReturnType<SidebarActionFunction>) => {
      return action && !(action.disableInReadOnlyMode && readOnlyMode.value)
    }

    const actions = actionGeneratingFns.map((actionFn) => actionFn(item as any)) as SidebarAction[]
    return actions.filter(actionFilter)
  })
}
