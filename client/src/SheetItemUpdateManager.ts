import { updateByRow } from "./SheetsAPI";
import type { Ref } from "vue";
import type { SheetItem } from "./SheetTypes";
import type { Panel } from "./SwitchPanel";
import { watch } from "vue";

export function useUpdateManager(selectedItemRef: Ref<SheetItem>, panel: Ref<Panel<SheetItem>>) {

  async function updateItem(item: SheetItem) {
    await updateByRow(
      panel.value.sheetRange, 
      item.row, 
      await panel.value.mappers.unmap([
        item
      ])
    )
  }

  watch(selectedItemRef, async (newItem, oldItem) => {
    if (!oldItem) return;
    await updateItem(oldItem);
  });
  
}