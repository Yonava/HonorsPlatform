import { updateByRow } from "./SheetsAPI"
import { inject } from "vue"
import type { Ref } from "vue"
import { Panel } from "./SwitchPanel"
import { SheetEntry } from "./SheetTypes"

export async function reqUpdate() {
  const panel = inject("activePanel") as Ref<Panel<SheetEntry>>
  const selectedItem = inject("selectedItem") as Ref<SheetEntry>
  await updateByRow(
    panel.value.sheetRange, 
    selectedItem.value.row, 
    await panel.value.mappers.unmap([
      selectedItem.value
    ])
  )
}