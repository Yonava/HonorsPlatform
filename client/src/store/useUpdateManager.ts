import { defineStore } from "pinia";
import { type PanelName, panels } from "../Panels";
import { SheetItem } from "../SheetTypes";
import { useDocumentCache } from "./useDocumentCache";
import { batchUpdate, postInRange, type BatchUpdateData } from "../SheetsAPI";
import { mappers } from "../DataMappers";
import { useSyncState } from "./useSyncState";
import { useSocket } from "./useSocket";

type UpdateItem = {
  // key is the sysId
  [key: string]: {
    panelName: PanelName,
    originalRowItem: any[],
    item: SheetItem,
  }
}

type UpdateProperty = {
  item: SheetItem,
  panelName: PanelName
}

const cells: Record<number, string> = {
  0: 'A',
  1: 'B',
  2: 'C',
  3: 'D',
  4: 'E',
  5: 'F',
  6: 'G',
  7: 'H',
  8: 'I',
  9: 'J',
  10: 'K',
  11: 'L',
  12: 'M',
  13: 'N',
  14: 'O',
  15: 'P',
  16: 'Q',
  17: 'R',
  18: 'S',
  19: 'T',
  20: 'U',
  21: 'V',
  22: 'W',
  23: 'X',
  24: 'Y',
  25: 'Z',
} as const

export const useUpdateManager = defineStore('updateManager', {
  state: () => ({
    // a list of items that need to be updated
    updater: {} as UpdateItem,
    // a timeout that will execute the google sheets update
    timeout: null as null | ReturnType<typeof setTimeout>,
    // debounce time for the timeout
    debounceMs: 2000,
  }),
  getters: {},
  actions: {
    addItemToUpdater(sysId: string, panelName: PanelName) {

      if (!sysId) {
        throw new Error(`sysId is required`)
      }

      const { getItemBySysId } = useDocumentCache()
      const item = getItemBySysId(sysId, panelName)

      if (!item) {
        throw new Error(`Could not find item with sysId ${sysId} in panel ${panelName}`)
      }

      this.updater[sysId] = {
        panelName,
        originalRowItem: mappers[panelName].unmap(item),
        item,
      }
    },
    async manageTimeout() {
      // if the timeout is already set, clear it
      if (this.timeout) {
        clearTimeout(this.timeout)
      }

      // set a new timeout
      this.timeout = setTimeout(() => {
        this.executeGoogleSheetsUpdate()
      }, this.debounceMs)
    },
    trackItemForUpdate({ item, panelName }: UpdateProperty) {

      const { sysId } = item

      // indicate processing to the user
      const { setProcessing } = useSyncState()
      setProcessing(true)

      // add item to updater if it is not already there
      if (!this.updater[sysId]) {
        this.updater[sysId] = {
          panelName,
          originalRowItem: mappers[panelName].unmap([item])[0],
          item,
        }
      }

      // clear the timeout and set a new one
      this.manageTimeout()
    },
    async executeGoogleSheetsUpdate() {
      // parse the updater object into a list of requests to send to the google sheets api

      const sysIds = Object.keys(this.updater) as string[]

      const data: BatchUpdateData = []

      for (const sysId of sysIds) {
        const { item, originalRowItem, panelName } = this.updater[sysId]
        const rowItem = mappers[panelName].unmap([item])[0]
        const panel = panels[panelName]

        if (typeof item.row !== 'number') {
          await this.postItem({ item, panelName })
          continue
        }

        for (let i = 0; i < rowItem.length; i++) {
          if (rowItem[i] !== originalRowItem[i]) {

            if (i > 25) {
              throw new Error('Column index is greater than 25')
            }

            data.push({
              range: `${panel.sheetRange}!${cells[i]}${item.row}`,
              values: [[rowItem[i]]]
            })
          }
        }
      }

      if (data.length > 0) {
        await batchUpdate(data)
      }

      this.updater = {}

      useSyncState().$reset()
    },
    async postItem({ item, panelName }: UpdateProperty) {

      const { sheetRange } = panels[panelName]
      const { unmap } = mappers[panelName]

      const row = await postInRange(sheetRange, unmap([item]))
      item.row = row

      const { emitUserAction } = useSocket()
      emitUserAction({
        action: 'add',
        payload: {
          panelName,
          item,
        }
      })
    }
  }
})