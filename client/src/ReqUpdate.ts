import { updateByRow } from "./SheetsAPI"
import { inject } from "vue"
import type { Ref } from "vue"
import { Panel } from "./SwitchPanel"
import { SheetEntry } from "./SheetTypes"

export async function reqUpdate(item: SheetEntry) {
  const panel = inject("activePanel") as Ref<Panel<SheetEntry>>
  await updateByRow(
    panel.value.sheetRange, 
    item.row, 
    await panel.value.mappers.unmap([item])
  )
}