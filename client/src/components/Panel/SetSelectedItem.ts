import type { SheetItem } from '../../SheetTypes'
import { useSheetManager } from '../../store/useSheetManager'
import { useDocumentCache } from '../../store/useDocumentCache'

export const setSelectedItem = (item: SheetItem) => {
  const { focusedItem } = useSheetManager()
  const { getSelectedItems, setSelectedItems, addSelectedItem } = useDocumentCache()
  const selectedItems = getSelectedItems()
  const focusedItemIndex = selectedItems.findIndex(i => i.sysId === focusedItem?.sysId)
  const selectedItemIndex = selectedItems.findIndex(i => i.sysId === item.sysId)

  // if the item is already selected, focus it
  if (selectedItemIndex !== -1) {
    useSheetManager().focusedItem = item
    return
  }

  if (focusedItemIndex === -1) {
    addSelectedItem({ item })
  } else {
    const newSelectedItems = [...selectedItems]
    newSelectedItems[focusedItemIndex] = item
    setSelectedItems({
      items: newSelectedItems
    })
    useSheetManager().focusedItem = item
  }
}