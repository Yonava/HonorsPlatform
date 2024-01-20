import { defineStore } from "pinia";
import { getRange, clearByRow, postInRange, getRanges } from '../SheetsAPI';
import { panels, Panel, PanelName, getPanel } from "../Panels";
import * as types from "../SheetTypes";
import { useSheetManager } from "./useSheetManager";
import { warn } from "../Warn";
import { useSyncState } from "./useSyncState";
import { storeToRefs } from "pinia";
import { setSelectedItem } from '../components/Panel/SetSelectedItem'
  import { useSocket } from "./useSocket";
import { useDialog } from "./useDialog";

type GetAllDocuments = {
  showLoading?: boolean;
  forceCacheRefresh?: boolean;
  panelName?: PanelName;
}

type GetItemByKeyValue = {
  key?: string;
  value?: string | undefined;
  panelName?: PanelName;
}

type RefreshCache = {
  panelName?: PanelName;
  data?: string[][];
}

type DueForRefresh = {
  panel?: Panel;
  checkDependentPanels?: boolean;
}

type AddSelectedItem = {
  item: types.SheetItem;
  panel?: Panel;
}

type SetSelectedItems = {
  items: types.SheetItem[];
  panel?: Panel;
}

type RemoveSelectedItem = {
  item: types.SheetItem;
  panel?: Panel;
}

type SetSelectedItemByKeyValue = {
  key?: string;
  value?: string | undefined;
  panel?: Panel;
}

type DeleteItem = {
  item: types.SheetItem;
  panelName?: PanelName;
  showWarning?: boolean;
  concurrent?: boolean;
}

type AddItem = {
  panelName?: PanelName;
  postToSheet?: boolean;
  columns?: any[];
}

type MoveItemBetweenLists = {
  item: types.SheetItem;
  oldPanelName: PanelName;
  newPanelName: PanelName;
}

type MoveItemBetweenListsCache = {
  item: types.SheetItem;
  oldPanelName: PanelName;
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
    Announcements: [] as types.Announcement[],
  }),
  getters: {
    itemPostedToSheet: (state) => (item: types.SheetItem) => {
      return typeof item.row === "number";
    },
    getAnnouncements: (state) => () => {
      return state.Announcements;
    },
    getItems: (state) => (panelName?: PanelName) => {
      const { panel: activePanel } = useSheetManager();
      const actualPanelName = panelName ?? activePanel.panelName;
      const panel = panels[actualPanelName];
      return state[panel.sheetRange].list;
    },
    getSelectedItems: (state) => (panelObject?: Panel) => {
      const { panel: activePanel } = useSheetManager();
      const panel = panelObject ?? activePanel;
      return state[panel.sheetRange].selected;
    },
    getItemBySysId: (state) => <T extends PanelName>(sysId: string, panelName?: T) => {
      const { panel: activePanel } = useSheetManager();
      if (panelName) {
        const panel = getPanel(panelName);
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
    addAnnouncementCache(announcement: types.Announcement) {
      const { Announcements } = this;
      Announcements.push(announcement);
    },
    async postAnnouncement(announcement: types.Announcement) {

      await postInRange('Announcements', [[
        announcement.sysId,
        announcement.content,
        announcement.posterName,
        announcement.posterPhoto,
        announcement.datePosted,
        announcement.expiryDate,
        announcement.panelType
      ]])

      this.addAnnouncementCache(announcement)

      const { emitUserAction } = useSocket()
      emitUserAction({
        action: 'announce',
        payload: announcement
      })
    },
    getAllDocuments(options: GetAllDocuments = {}) {
      const { setLoadingItems, setSort, getActivePanel } = useSheetManager();
      const {
        showLoading = true,
        forceCacheRefresh = false,
        panelName = getActivePanel.panelName,
      } = options;

      const panel = panels[panelName];

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

      this.Announcements = announcementsData?.Announcements.map((announcementRow) => {
        return {
          sysId: announcementRow[0],
          content: announcementRow[1],
          posterName: announcementRow[2],
          posterPhoto: announcementRow[3],
          datePosted: announcementRow[4],
          expiryDate: announcementRow[5],
          panelType: announcementRow[6]
        }
      }) ?? [];

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
          panelName: panelKey,
          data: rangeDataObj[panels[panelKey].sheetRange]
        })
      }
    },
    async refreshCache(options: RefreshCache = {}) {
      const {
        focusedItemSysId,
        getActivePanel,
        setFocusedItem,
        pinnedSysIds
      } = useSheetManager();

      const {
        panelName = getActivePanel.panelName,
      } = options;

      const panel = panels[panelName];
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

      const selectedSysIds = [...this[range].selected].map((item) => item.sysId);
      this[range].selected = selectedSysIds.map((sysId) => {
        return this.getItemBySysId(sysId, panelName) as types.SheetItem
      }).filter((item) => item);

      const focusedItemStillExists = !!this[range].selected.find((item) => item.sysId === focusedItemSysId);

      if (!focusedItemStillExists && this[range].selected.length > 0) {
        setFocusedItem(this[range].selected[0].sysId)
      }

      // clean up pinned items
      if (panel.panelName === getActivePanel.panelName) {
        useSheetManager().pinnedSysIds = pinnedSysIds.filter((sysId) => {
          return this[range].list.some((item) => {
            return item.sysId === sysId
          })
        })
      }

      this.refreshLog[range] = new Date();
      return documents;
    },
    setSelectedItems(options: SetSelectedItems) {
      const { panel: activePanel, setFocusedItem } = useSheetManager();

      const {
        panel = activePanel,
        items
      } = options;

      this[panel.sheetRange].selected = items;

      const onActivePanel = panel.panelName === activePanel.panelName;

      if (!onActivePanel) {
        return
      }

      setTimeout(() => {
        if (items.length > 0) {
          setFocusedItem(items[0].sysId)
        } else {
          setFocusedItem('')
        }
      }, 0)
    },
    addSelectedItem(options: AddSelectedItem) {
      const { panel: activePanel, setFocusedItem } = useSheetManager();

      const {
        panel = activePanel,
        item
      } = options;

      const onActivePanel = panel.panelName === activePanel.panelName;

      if (onActivePanel) {
        setFocusedItem(item.sysId)
      }

      this[panel.sheetRange].selected.push(item);
    },
    removeSelectedItem(options: RemoveSelectedItem) {
      const {
        panel: activePanel,
        focusedItemSysId,
        setFocusedItem
      } = useSheetManager();

      const {
        panel = activePanel,
        item,
      } = options;

      const selectedItems = this[panel.sheetRange].selected;

      const indexOfFocusedItemInSelected = selectedItems.findIndex((selectedItem) => selectedItem.sysId === focusedItemSysId);
      const itemBeingRemovedIsFocused = item.sysId === focusedItemSysId;
      const thereIsAnotherItemSelected = selectedItems.length > 1;


      if (itemBeingRemovedIsFocused && thereIsAnotherItemSelected) {
        const itemToTheLeft = selectedItems[indexOfFocusedItemInSelected - 1];
        const itemToTheRight = selectedItems[indexOfFocusedItemInSelected + 1];
        const nextFocusedItem = itemToTheRight || itemToTheLeft;
        setFocusedItem(nextFocusedItem.sysId);
      } else if (itemBeingRemovedIsFocused) {
        setFocusedItem("")
      }

      const indexOfItemInSelected = selectedItems.findIndex((selectedItem) => selectedItem.sysId === item.sysId);
      selectedItems.splice(indexOfItemInSelected, 1);
    },
    setSelectedItemByKeyValue(options: SetSelectedItemByKeyValue = {}) {
      const { panel: activePanel } = useSheetManager();

      const {
        panel = activePanel,
        key = "sysId",
        value = null,
      } = options;

      if (value === null) {
        console.error("useDocumentCache.setSelectedItemByKeyValue: value is undefined");
        return null;
      }

      const item = this[panel.sheetRange].list.find(item => item[key] === value) as types.SheetItem | undefined
      if (!item) {
        return null;
      }

      this.setSelectedItems({
        panel,
        items: [item]
      })

      return item;
    },
    setSelectedItemBySysId(sysId: string, panelName?: PanelName) {
      const { panel: activePanel } = useSheetManager();
      const actualPanelName = panelName ?? activePanel.panelName;
      const panel = panels[actualPanelName];
      return this.setSelectedItemByKeyValue({
        panel,
        key: "sysId",
        value: sysId
      })
    },
    deleteItemCache(sysId: string, panelName?: PanelName) {
      const {
        panel: activePanel,
        focusedEmbeddedItem,
        setFocusedEmbeddedItem
      } = useSheetManager();

      if (focusedEmbeddedItem?.sysId === sysId) {
        setFocusedEmbeddedItem(null);
      }

      const actualPanelName = panelName ?? activePanel.panelName;
      const panel = panels[actualPanelName];

      const indexOfItemToDelete = this[panel.sheetRange].list.findIndex(item => item.sysId === sysId);

      if (indexOfItemToDelete === -1) {
        return
      }

      this[panel.sheetRange].list.splice(indexOfItemToDelete, 1);

      const itemToDeleteInSelected = this[panel.sheetRange].selected.find(item => item.sysId === sysId);

      if (!itemToDeleteInSelected) {
        return
      }

      this.removeSelectedItem({
        item: itemToDeleteInSelected,
        panel
      });
    },
    async deleteItem(options: DeleteItem) {
      const syncState = useSyncState();
      const { getActivePanel } = useSheetManager();
      const { setProcessing, waitUntilSynced } = syncState;
      const { processing } = storeToRefs(syncState);

      const {
        item,
        panelName = getActivePanel.panelName,
        showWarning = true,
        concurrent = false
      } = options;

      if (!item) {
        console.error("useDocumentCache: No item to delete");
        return;
      }

      if (!this.itemPostedToSheet(item) && !processing.value) {
        console.log("useDocumentCache: No row to delete, not hitting API");
        this.deleteItemCache(item.sysId, panelName);
        return;
      }

      const panel = panels[panelName];

      let title = item[panel.properties.title]
      title ||= panel.title.singular

      if (showWarning) {
        try {
          await warn({
            title: `Delete ${title}?`
          })
        } catch (e) {
          console.warn(e);
          return
        }
      }

      if (!concurrent && processing.value) {
        await waitUntilSynced({
          showDialog: true
        });
      }

      const { sysId, row } = item as { sysId: string, row: number }

      if (this.itemPostedToSheet(item)) {
        this.deleteItemCache(sysId, panelName);
        setProcessing(true);
        await clearByRow(panel.sheetRange, row);
      } else {
        console.error("useDocumentCache: deleteItem started processing without item being saved to sheet!");
        return;
      }

      useDialog().openSnackbar({
        text: `${title} Deleted`,
      })

      const { emitUserAction } = useSocket()
      await emitUserAction({
        action: 'delete',
        payload: {
          sysId: item.sysId,
          panelName
        }
      })

      useSyncState().$reset();
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
        getActivePanel,
        newSysId,
      } = useSheetManager();

      const {
        panelName = getActivePanel.panelName,
        postToSheet = false,
        columns = null,
      } = options;

      const panel = panels[panelName];

      const [newItem] = await panel.mappers.map([
        columns ? [newSysId(), ...columns] : [newSysId()]
      ]);
      newItem.row = null;

      const onActivePanel = panelName === getActivePanel.panelName;
      if (onActivePanel) {
        setSelectedItem(newItem)
        setSearchFilter("");
      }

      this.addItemCache(newItem, panelName);

      if (postToSheet) {
        useSyncState().setProcessing(true);
        const row = await postInRange(
          panel.sheetRange,
          await panel.mappers.unmap([newItem])
        )
        newItem.row = row
        useSyncState().$reset();

        const { emitUserAction } = useSocket()
        emitUserAction({
          action: 'add',
          payload: {
            item: newItem,
            panelName
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
    moveItemBetweenListsCache({ item, oldPanelName, newPanelName }: MoveItemBetweenListsCache) {
      this.addItemCache(item, newPanelName);
      this.deleteItemCache(item.sysId, oldPanelName);
    },
    async moveItemBetweenLists({ item, oldPanelName, newPanelName }: MoveItemBetweenLists) {
      const { waitUntilSynced } = useSyncState();

      if (!this.itemPostedToSheet(item)) {
        throw new Error("useDocumentCache: Cannot move item that hasn't been saved to the sheet yet");
      }

      await waitUntilSynced({ showDialog: true });

      const oldPanel = panels[oldPanelName];
      const newPanel = panels[newPanelName];

      const { row: oldRow } = item;

      if (!oldRow) {
        throw new Error("useDocumentCache: Cannot move item that doesn't have a row");
      }

      const row = await postInRange(
        newPanel.sheetRange,
        await newPanel.mappers.unmap([item])
      )
      item.row = row;

      await clearByRow(oldPanel.sheetRange, oldRow);

      this.moveItemBetweenListsCache({ item, oldPanelName, newPanelName });

      const { emitUserAction } = useSocket()
      emitUserAction({
        action: 'move',
        payload: {
          item,
          oldPanelName,
          newPanelName
        }
      })
    },
    async forceConnectedClientsToRefresh() {
      const { emitUserAction } = useSocket()
      emitUserAction({
        action: 'refresh'
      })

      await this.getAllDocuments({
        showLoading: false,
        forceCacheRefresh: true
      })
    }
  }
})