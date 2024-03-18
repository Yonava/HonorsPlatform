import { defineStore } from "pinia";
import { type PanelName, panels } from "@panels";
import type { SheetItem } from "@apptypes/sheetItems";
import { batchUpdate, postInRange, type BatchUpdateData } from "../SheetsAPI";
import { mappers } from "@data/DataMappers";
import { useSyncState } from "@store/useSyncState";
import { useSocket } from "@store/useSocket";
import { useSheetManager } from "@store/useSheetManager";

type UpdateItem = {
  // key is the sysId
  [key: string]: {
    panelName: PanelName,
    originalRowItem: any[],
    item: SheetItem,
  }
}

type TrackItemForUpdateOptions<T extends SheetItem> = {
  item?: T | undefined,
  panelName?: PanelName
}

const getLetterFromColIndex = (colIndex: number) => {
  if (colIndex < 0 || colIndex > 25) {
    throw new Error('Code is not a valid capital letter')
  }
  return String.fromCharCode(colIndex + 65)
}

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
    trackItemForUpdate<T extends SheetItem>(options: TrackItemForUpdateOptions<T> = {}) {

      const { getFocusedItem, getActivePanel } = useSheetManager()
      const {
        item = getFocusedItem as T,
        panelName = getActivePanel.panelName
      } = options

      if (!item) {
        console.warn('No item to track for update')
        return
      }

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
        const { item, originalRowItem, panelName } = this.updater[sysId] as {
          item: SheetItem,
          originalRowItem: any[],
          panelName: PanelName
        }

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

            const column = getLetterFromColIndex(i)

            data.push({
              range: `${panel.sheetRange}!${column}${item.row}`,
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
    async postItem<T extends SheetItem>(options: TrackItemForUpdateOptions<T> = {}) {

      const { getFocusedItem, getActivePanel } = useSheetManager()
      const {
        item = getFocusedItem as T,
        panelName = getActivePanel.panelName
      } = options

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