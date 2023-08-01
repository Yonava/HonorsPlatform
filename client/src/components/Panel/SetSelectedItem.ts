import type { SheetItem } from '../../SheetTypes'
import { useSheetManager } from '../../store/useSheetManager'
import { useDocumentCache } from '../../store/useDocumentCache'

export const setSelectedItem = (item: SheetItem) => {
  const { setFocusedItem, focusedItemSysId } = useSheetManager()
  const { getSelectedItems, addSelectedItem } = useDocumentCache()
  const selectedItems = getSelectedItems()

  const itemIsAlreadySelected = selectedItems.find(i => i.sysId === item.sysId)
  if (itemIsAlreadySelected) {
    setFocusedItem(item.sysId)
    return
  }

  // replace the focused item with the new item
  const indexOfFocusedItem = selectedItems.findIndex(i => i.sysId === focusedItemSysId)
  console.log('indexOfFocusedItem', indexOfFocusedItem)
  if (indexOfFocusedItem !== -1) {
    selectedItems.splice(indexOfFocusedItem, 1, item)
    setFocusedItem(item.sysId)
    return
  }

  // if there happens to be no focused item, append the new item to the end of selected items
  addSelectedItem({ item })
}