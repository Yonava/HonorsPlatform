import { defineStore } from 'pinia'
import { useDialog } from '@store/useDialog'
import { ref, computed } from 'vue'
import { panels, type PanelName, type PanelRange, rangeToPanelName, type SheetRangeToType } from '@panels'
import { getRanges, getAllSheetItemRanges } from '../SheetsAPI'

export type SheetItemCache = {
  [K in PanelName]: SheetRangeToType[K][]
}

const initItemCache = () => Object.values(panels).reduce((acc, { panelName }) => {
  acc[panelName] = []
  return acc
}, {} as SheetItemCache)

export const useSheetItemCache = defineStore('sheetItemCache', () => {
  const items = ref(initItemCache())
  const raw = ref<any>(null)

  const getRaw = async () => {
    const spreadsheet = await getAllSheetItemRanges()
    spreadsheet.forEach(({ range, values }) => {
      const sheetRange = range.split('!')[0] as PanelRange
      const panelName = rangeToPanelName[sheetRange]
      items.value[panelName] = panels[panelName].mappers.map(values)
    })
  }

  getRaw()

  const debug = () => useDialog().open({
    title: 'Sheet Item Cache',
    description: JSON.stringify(items.value, null, 2) + '\n\n' + JSON.stringify(raw.value, null, 2)
  })

  return {
    items,
    debug
  }
})