import { defineStore } from "pinia";
import { type PanelName, panels } from "../Panels";
import { SheetItem } from "../SheetTypes";
import { useDocumentCache } from "./useDocumentCache";
import { useSocket } from "./useSocket";
import { mappers } from "../DataMappers";
import { useSyncState } from "./useSyncState";

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
    manageTimeout() {
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

      for (const sysId of sysIds) {
        const { item, originalRowItem, panelName } = this.updater[sysId]
        const rowItem = mappers[panelName].unmap([item])[0]
        console.log({ rowItem, originalRowItem, panelName })
      }

      this.updater = {}

      useSyncState().$reset()
    }
  }
})