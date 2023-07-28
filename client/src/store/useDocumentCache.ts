import { defineStore } from "pinia";
import { getRange, clearByRow, updateByRow, postInRange, getRanges } from '../SheetsAPI';
import { panels, Panel, PanelName } from "../Panels";
import * as types from "../SheetTypes";
import { useSheetManager } from "./useSheetManager";
import { warn } from "../Warn";
import { useSyncState } from "./useSyncState";
import { storeToRefs } from "pinia";
import { setSelectedItem } from '../components/Panel/SetSelectedItem'
import { useAuth } from "./useAuth";

type GetAllDocuments = {
  showLoading?: boolean;
  forceCacheRefresh?: boolean;
  panel?: Panel;
}

type GetItemByKeyValue = {
  key?: string;
  value?: string | undefined;
  panelName?: PanelName;
}

type RefreshCache = {
  panel?: Panel;
  data?: string[][];
}

type DueForRefresh = {
  panel?: Panel;
  checkDependentPanels?: boolean;
}

type AddSelectedItem = {
  item?: types.SheetItem;
  panel?: Panel;
}

type SetSelectedItems = {
  items?: types.SheetItem[];
  panel?: Panel;
}

type RemoveSelectedItem = {
  item?: types.SheetItem;
  panel?: Panel;
}

type SetSelectedItemByKeyValue = {
  key?: string;
  value?: string | undefined;
  panel?: Panel;
}

type DeleteItem = {
  item?: types.SheetItem;
  panel?: Panel;
  showWarning?: boolean;
  concurrent?: boolean;
}

type AddItem = {
  panel?: Panel;
  pin?: boolean;
  postToSheet?: boolean;
  columns?: any[];
}

type UpdateItem = {
  item?: types.SheetItem;
  panel?: Panel;
}

type MoveItemBetweenLists = {
  oldItem: types.SheetItem;
  oldPanel: Panel;
  newItem: types.SheetItem;
  newPanel: Panel;
}

type MoveItemBetweenListsCache = {
  oldSysId: string;
  oldPanelName: PanelName;
  newItem: types.SheetItem;
  newPanelName: PanelName;
}

type PanelState<T> = {
  list: T[];
  selected: T[];
}

export const useDocumentCache = defineStore("documentCache", {
  state: () => ({
    cacheRefreshInProgress: null as Promise<void> | null,
    refreshLog: {} as Record<string, Date>,
    refreshAfter: 1000 * 60 * 5, // 5 minutes
    Students: {
      list: [],
      selected: [],
    } as PanelState<types.Student>,
    Graduates: {
      list: [],
      selected: [],
    } as PanelState<types.Graduate>,
    "Grad Engagements": {
      list: [],
      selected: [],
    } as PanelState<types.GradEngagement>,
    Modules: {
      list: [],
      selected: [],
    } as PanelState<types.Module>,
    "Completed Modules": {
      list: [],
      selected: [],
    } as PanelState<types.CompletedModule>,
    Theses: {
      list: [],
      selected: [],
    } as PanelState<types.Thesis>,
    Announcements: [[]] as string[][],
  }),
  getters: {
    getPanelListData: (state) => (panelObject?: Panel) => {
      const { panel: activePanel } = useSheetManager();
      const panel = panelObject ?? activePanel;
      return state[panel.sheetRange].list;
    },
    getSelectedItems: (state) => (panelObject?: Panel) => {
      const { panel: activePanel } = useSheetManager();
      const panel = panelObject ?? activePanel;
      return state[panel.sheetRange].selected;
    },
    getItemBySysId: (state) => (sysId: string, panelName?: PanelName) => {
      const { panel: activePanel } = useSheetManager();
      if (panelName) {
        const panel = panels[panelName];
        return state[panel.sheetRange].list.find((item) => item.sysId === sysId);
      }
      return state[activePanel.sheetRange].list.find((item) => item.sysId === sysId);
    },
    getItemByKeyValue: (state) => (options: GetItemByKeyValue = {}) => {
      const {
        key = "sysId",
        value = "",
        panelName,
      } = options;

      const { panel: activePanel } = useSheetManager();
      if (panelName) {
        const panel = panels[panelName];
        return state[panel.sheetRange].list.find((item) => item[key] === value);
      }
      return state[activePanel.sheetRange].list.find((item) => item[key] === value);
    },
    dueForRefresh: (state) => (options: DueForRefresh = {}) => {
      const {
        panel = useSheetManager().panel,
        checkDependentPanels = true,
      } = options;
      const lastRefresh = state.refreshLog[panel.sheetRange];

      const timesSinceLastRefresh = []

      if (!lastRefresh) {
        return true;
      } else {
        timesSinceLastRefresh.push(lastRefresh);
      }

      if (checkDependentPanels) {
        const dependentPanelNames = panel.dependencies;
        for (const dependentPanelName of dependentPanelNames) {
          const dependentPanel = panels[dependentPanelName];
          const dependentLastRefresh = state.refreshLog[dependentPanel.sheetRange];
          if (!dependentLastRefresh) {
            return true;
          } else {
            timesSinceLastRefresh.push(dependentLastRefresh);
          }
        }
      }

      const now = new Date();
      return timesSinceLastRefresh.some((time) => {
        const timeSinceLastRefresh = now.getTime() - time.getTime();
        return timeSinceLastRefresh > state.refreshAfter;
      });
    }
  },
  actions: {
    getAllDocuments(options: GetAllDocuments = {}) {
      const { setLoadingItems, setSort, getActivePanel } = useSheetManager();
      const {
        showLoading = true,
        forceCacheRefresh = false,
        panel = getActivePanel,
      } = options;

      if (this.cacheRefreshInProgress) {
        return
      }

      if (showLoading) {
        setLoadingItems(true);
      }

      const shouldRefresh = this.dueForRefresh({ panel });

      if (!forceCacheRefresh && !shouldRefresh) {
        setLoadingItems(false);
        setSort();
        return;
      }
      this.cacheRefreshInProgress = this.refreshEntireCache();
      this.cacheRefreshInProgress.then(() => {
        this.cacheRefreshInProgress = null;
        setLoadingItems(false);
        setSort();
      })
    },
    async refreshEntireCache() {
      if (this.cacheRefreshInProgress) {
        return
      }

      const fullSheetData = await getRanges();

      const announcementsData = fullSheetData.find((rangeDataObject) => {
        const range = Object.keys(rangeDataObject)[0]
        return range === "Announcements"
      })

      this.Announcements = announcementsData?.Announcements ?? [[]];

      const panelKeys = Object.keys(panels) as (keyof typeof panels)[];
      for (const panelKey of panelKeys) {

        // type rangeDataObject = { Range: string[][] }
        const rangeDataObj = fullSheetData.find((rangeDataObject) => {
          const range = Object.keys(rangeDataObject)[0]
          return range === panels[panelKey].sheetRange
        });

        if (!rangeDataObj) {
          console.warn(`useDocumentCache.init: no data found for ${panels[panelKey].sheetRange}`)
          continue
        }

        this.refreshCache({
          panel: panels[panelKey],
          data: rangeDataObj[panels[panelKey].sheetRange]
        })
      }
    },
    async refreshCache(options: RefreshCache = {}) {
      const {
        panel = useSheetManager().panel,
      } = options;

      const range = panel.sheetRange;

      if (!options.data) {
        if (this.cacheRefreshInProgress) {
          await this.cacheRefreshInProgress;
          return;
        }
        options.data = await getRange(panel.sheetRange);
      }

      const { data } = options;

      const documents = await panel.mappers.map(data);
      this[range].list = documents;

      // clean up selected items
      const oldSelectedItems = [...this[range].selected]
      const oldFocusedItem = JSON.parse(JSON.stringify((useSheetManager().focusedItem)))
      this[range].selected = []

      for (const oldSelectedItem of oldSelectedItems) {
        const itemInNewData = this[range].list.find((item) => {
          return item.sysId === oldSelectedItem.sysId
        })

        if (itemInNewData) {
          this.addSelectedItem({
            item: itemInNewData
          })
        }
      }

      const focusedItemInNewData = this[range].list.find((item) => {
        return item.sysId === oldFocusedItem?.sysId
      })

      if (focusedItemInNewData) {
        useSheetManager().setFocusedItem(focusedItemInNewData)
      }

      // clean up pinned items
      if (panel.sheetRange === useSheetManager().getActivePanel.sheetRange) {
        useSheetManager().pinnedSysIds = useSheetManager().pinnedSysIds.filter((sysId) => {
          return this[range].list.some((item) => {
            return item.sysId === sysId
          })
        })
      }

      this.refreshLog[range] = new Date();
      return documents;
    },
    setSelectedItems(options: SetSelectedItems = {}) {
      const { panel: activePanel } = useSheetManager();
      const {
        panel = activePanel,
        items = []
      } = options;
      this[panel.sheetRange].selected = items;
    },
    addSelectedItem(options: AddSelectedItem = {}) {
      const { panel: activePanel } = useSheetManager();
      const { panel = activePanel, item = null } = options;
      if (item === null) {
        console.error("useDocumentCache.addSelectedItem: item is null");
        return;
      }
      if (panel === activePanel) {
        useSheetManager().setFocusedItem(item);
      }
      this[panel.sheetRange].selected.push(item);
    },
    removeSelectedItem(options: RemoveSelectedItem = {}) {
      const { panel: activePanel } = useSheetManager();

      const {
        panel = activePanel,
        item = useSheetManager().focusedItem
      } = options;

      if (!item) {
        console.error("useDocumentCache.removeSelectedItem: item is undefined");
        return;
      }

      if (panel === activePanel && item.sysId === useSheetManager().focusedItem?.sysId) {
        const focusedItemIndex = this[panel.sheetRange].selected.findIndex((selectedItem) => selectedItem.sysId === item.sysId);

        if (this[panel.sheetRange].selected.length > 1) {
          const nextFocusedItem = this[panel.sheetRange].selected[focusedItemIndex + 1] ?? this[panel.sheetRange].selected[focusedItemIndex - 1];

          setTimeout(() => {
            useSheetManager().setFocusedItem(nextFocusedItem);
          }, 0);
        }
      }

      const index = this[panel.sheetRange].selected.findIndex((selectedItem) => selectedItem.sysId === item.sysId);
      this[panel.sheetRange].selected.splice(index, 1);
    },
    setSelectedItemByKeyValue(options: SetSelectedItemByKeyValue = {}) {
      const { panel: activePanel } = useSheetManager();

      const {
        panel = activePanel,
        key = "sysId",
        value = undefined,
      } = options;

      if (value === undefined) {
        console.error("useDocumentCache.setSelectedItemByKeyValue: value is undefined");
        return null;
      }

      const item = this[panel.sheetRange].list.find(item => item[key] === value);
      if (item) {
        this[panel.sheetRange].selected = [item];
        setTimeout(() => {
          useSheetManager().setFocusedItem(item)
        }, 0)
        return item;
      } else {
        return null;
      }
    },
    setSelectedItemBySysId(sysId: string, panelObject?: Panel) {
      const { panel: activePanel } = useSheetManager();
      const panel = panelObject ?? activePanel;
      const item = this[panel.sheetRange].list.find(item => item.sysId === sysId);
      if (item) {
        this[panel.sheetRange].selected = [item];
        return item;
      } else {
        return null;
      }
    },
    deleteItemCache(sysId: string, panelObject?: Panel) {
      const { panel: activePanel, pinnedSysIds } = useSheetManager();
      const panel = panelObject ?? activePanel;
      const index = this[panel.sheetRange].list.findIndex(item => item.sysId === sysId);

      const selectedItem = this[panel.sheetRange].selected.find(item => item.sysId === sysId);

      if (index !== -1) {
        this[panel.sheetRange].list.splice(index, 1);
      }

      const pinnedSysIdIndex = pinnedSysIds.indexOf(sysId)
      if (pinnedSysIdIndex !== -1) {
        pinnedSysIds.splice(pinnedSysIdIndex, 1)
      }

      if (selectedItem) {
        this.removeSelectedItem({
          item: selectedItem,
          panel
        });
      }
    },
    async deleteItem(options: DeleteItem = {}) {
      const { panel: activePanel, focusedItem } = useSheetManager();
      const syncState = useSyncState();
      const { setProcessing, waitUntilSynced } = syncState;
      const { processing } = storeToRefs(syncState);

      const {
        item = focusedItem,
        panel = activePanel,
        showWarning = true,
        concurrent = false
      } = options;

      if (!item) {
        console.error("useDocumentCache: No item to delete");
        return;
      }

      // no row means it's a new item that hasn't been saved to the sheet yet
      if (typeof item.row !== "number" && !processing.value) {
        console.log("useDocumentCache: No row to delete, not hitting API");
        this.deleteItemCache(item.sysId, panel);
        return;
      }

      if (showWarning) {
        try {
          let title = item[panel.properties.title]
          title = title ? `"${title}"` : panel.title.singular
          await warn({
            title: `Delete ${title}?`
          })
        } catch (e) {
          console.warn(e);
          return
        }
      }

      if (!concurrent && processing.value) {
        await waitUntilSynced({ showDialog: true });
      }

      const { sysId, row } = item;

      setProcessing(true);

      if (typeof row === "number") {
        this.deleteItemCache(sysId, panel);
        await clearByRow(panel.sheetRange, row);
      } else {
        console.error("useDocumentCache: deleteItem started processing without an assigned row!");
      }

      useSyncState().$reset();

      const { socket } = useAuth()
      socket.emit('userAction', {
        action: 'delete',
        payload: {
          sysId,
          panelObject: panel
        }
      })
    },
    addItemCache(item: types.SheetItem, panelName: PanelName) {
      const { activateListTransition, getActivePanel } = useSheetManager();
      if (panelName === getActivePanel.panelName) {
        activateListTransition();
      }
      const panel = panels[panelName];
      this[panel.sheetRange].list.unshift(item);
    },
    async addItem(options: AddItem = {}): Promise<types.SheetItem> {
      const {
        setSearchFilter,
        panel: activePanel,
        newSysId,
        addPinnedItem,
      } = useSheetManager();

      const {
        panel = activePanel,
        pin = false,
        postToSheet = false,
        columns = null,
      } = options;

      if (panel === activePanel) {
        setSearchFilter("");
      }

      const [newItem] = await panel.mappers.map([
        columns ? [newSysId(), ...columns] : [newSysId()]
      ]);
      newItem.row = null;

      if (activePanel === panel) {
        setSelectedItem(newItem)
      } else {
        this[panel.sheetRange].selected = [newItem]
      }

      if (panel.panelName === activePanel.panelName) {
        useSheetManager().setFocusedItem(newItem)
      } else if (panel.panelName === activePanel?.embedded.panel) {
        console.log('embed added')
        useSheetManager().setFocusedEmbeddedItem(newItem)
      }

      this.addItemCache(newItem, panel.panelName);

      if (pin) {
        addPinnedItem(newItem);
      }

      if (postToSheet) {
        useSyncState().setProcessing(true);
        const row = await postInRange(
          panel.sheetRange,
          await panel.mappers.unmap([newItem])
        )
        newItem.row = row
        useSyncState().$reset();

        const { socket } = useAuth()
        socket.emit('userAction', {
          action: 'add',
          payload: {
            item: newItem,
            panelName: panel.panelName
          }
        })
      }

      return newItem;
    },
    updateItemCache(item: types.SheetItem, panelName: PanelName) {
      const panel = panels[panelName];
      const itemInList = this[panel.sheetRange].list.find((listItem: types.SheetItem) => listItem.sysId === item.sysId);
      if (itemInList) {
        Object.assign(itemInList, item);
      } else {
        console.error("updateItemCache: Item not in list");
      }

      return itemInList;
    },
    async updateItem(options: UpdateItem = {}) {
      const { panel: activePanel, focusedItem } = useSheetManager();
      const { setProcessing } = useSyncState();

      const {
        panel = activePanel,
        item = focusedItem,
      } = options;

      if (!item) {
        console.error("useDocumentCache: No item to update");
        return;
      } else if (typeof item.row !== "number") {
        setProcessing(true);
        const row = await postInRange(
          panel.sheetRange,
          await panel.mappers.unmap([item])
        )
        console.log("useDocumentCache: Posted to row", row)
        item.row = row
        useSyncState().$reset();

        const { socket } = useAuth()
        socket.emit('userAction', {
          action: 'add',
          payload: {
            item,
            panelName: panel.panelName
          }
        })

        return;
      }

      const itemInList = this.updateItemCache(item, panel.panelName);

      if (!itemInList) {
        return
      }

      setProcessing(true);

      await updateByRow(
        panel.sheetRange,
        item.row,
        await panel.mappers.unmap([item])
      )

      const { socket } = useAuth()
      socket.emit('userAction', {
        action: 'update',
        payload: {
          item,
          panelName: panel.panelName
        }
      })

      useSyncState().$reset();
    },
    moveItemBetweenListsCache({ oldSysId, oldPanelName, newItem, newPanelName }: MoveItemBetweenListsCache) {
      const oldPanel = panels[oldPanelName];
      this.addItemCache(newItem, newPanelName);
      this.deleteItemCache(oldSysId, oldPanel);
    },
    async moveItemBetweenLists({ oldItem, newItem, oldPanel, newPanel }: MoveItemBetweenLists) {
      const { waitUntilSynced } = useSyncState();

      if (typeof oldItem.row !== "number") {
        throw new Error("useDocumentCache: Cannot move item that hasn't been saved to the sheet yet");
      }

      await waitUntilSynced({ showDialog: true });

      const row = await postInRange(
        newPanel.sheetRange,
        await newPanel.mappers.unmap([newItem])
      )

      newItem.row = row;
      this.addItemCache(newItem, newPanel.panelName);

      await this.deleteItem({
        item: oldItem,
        panel: oldPanel,
        showWarning: false,
      })

      const { socket } = useAuth()

      socket.emit('userAction', {
        action: 'move',
        payload: {
          oldSysId: oldItem.sysId,
          oldPanelName: oldPanel.panelName,
          newItem,
          newPanelName: newPanel.panelName
        }
      })
    }
  }
})