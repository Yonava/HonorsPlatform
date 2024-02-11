import { panels, rangeToPanelName } from "@panels"
import type { PanelName, PanelRange, SheetRangeToType } from "@panels"
import { useSheetItemCache } from "@store/useSheetItemCache"
import { getAllSheetItemRanges } from "../SheetsAPI"
import type { SheetsAPIRange } from "../SheetsAPI"
import type { SheetItem } from "@apptypes/sheetItems"

export type SheetItemCache = {
  [K in PanelName]: SheetRangeToType[K][]
}

export const initItemCache = () => Object.values(panels).reduce((acc, { panelName }) => {
  acc[panelName] = []
  return acc
}, {} as SheetItemCache)

export const insertItemsIntoCache = (spreadsheets: SheetsAPIRange<PanelRange>[]) => {
  const cache = useSheetItemCache()
  spreadsheets.forEach(({ range, values }) => {
    const sheetRange = range.split('!')[0]
    const hasSpaces = sheetRange.startsWith('\'')
    const parsedSheetRange = hasSpaces ? sheetRange.slice(1, -1) : sheetRange
    const panelName = rangeToPanelName[parsedSheetRange as PanelRange]
    cache.replaceCachedItems(panelName, panels[panelName].mappers.map(values))
  })
}

export const populateCache = async () => {
  const spreadsheets = await getAllSheetItemRanges()
  insertItemsIntoCache(spreadsheets)
}

export const hasBeenUploaded = (item: SheetItem) => {
  return !(item.row === undefined || item.row === null)
}