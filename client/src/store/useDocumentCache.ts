import { defineStore } from "pinia";
import { getEvery, clearByRow, updateByRow, postInRange } from '../SheetsAPI';
import { getPanel, panels, Panel } from "../Panels";
import * as types from "../SheetTypes";
import { useSheetManager } from "./useSheetManager";
import { warn } from "../Warn";
import { useSyncState } from "./useSyncState";
import { storeToRefs } from "pinia";

type SetSelectedItem = {
  item?: types.SheetItem;
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

export const useDocumentCache = defineStore("documentCache", {
  state: () => ({
    refreshLog: {} as Record<string, Date>,
    refreshAfter: 1000 * 60 * 5, // 5 minutes
    Students: {
      list: [] as types.Student[],
      selected: null as types.Student | null,
    },
    Graduates: {
      list: [] as types.Graduate[],
      selected: null as types.Graduate | null,
    },
    "Grad Engagements": {
      list: [] as types.GradEngagement[],
      selected: null as types.GradEngagement | null,
    },
    Modules: {
      list: [] as types.Module[],
      selected: null as types.Module | null,
    },
    "Completed Modules": {
      list: [] as types.CompletedModule[],
      selected: null as types.CompletedModule | null,
    },
    Theses: {
      list: [] as types.Thesis[],
      selected: null as types.Thesis | null,
    },
  }),
  getters: {
    getSelectedItem: (state) => (panelObject?: Panel) => {
      const { panel: activePanel } = useSheetManager();
      const panel = panelObject ?? activePanel;
      return state[panel.sheetRange].selected;
    },
    dueForRefresh: (state) => (panelObject?: Panel) => {
      const { panel: activePanel } = useSheetManager();
      const panel = panelObject ?? activePanel;
      const lastRefresh = state.refreshLog[panel.sheetRange];
      if (!lastRefresh) {
        return true;
      }

      // return true if last refresh was more than refreshAfter milliseconds ago
      return Date.now() - lastRefresh.getTime() > state.refreshAfter;
    }
  },
  actions: {
    async refreshCache(panelObject?: Panel) {

      const { panel: activePanel } = useSheetManager();
      const panel = panelObject ?? activePanel;
      const range = panel.sheetRange;
      const data = await getEvery(range);
      const documents = await panel.mappers.map(data);
      this[range].list = documents;

      // clean up selected item
      if (this[range].selected) {
        const selectedItemInNewData = documents.find(item => item.sysId === this[range].selected?.sysId);
        if (!selectedItemInNewData) {
          this[range].selected = null;
        } else {
          this[range].selected = selectedItemInNewData;
        }
      }

      this.refreshLog[range] = new Date();

      // DANGER! This implementation may become a bit "loop-ey" 🤪
      if (panel?.embedded) {
        await this.refreshCache(getPanel(panel.embedded.panel));
      }
      return documents;
    },
    async refreshAll() {
      for (const panel of Object.keys(panels) as (keyof typeof panels)[]) {
        await this.refreshCache(panels[panel]);
      }
    },
    setSelectedItem(options: SetSelectedItem = {}) {
      const { panel: activePanel } = useSheetManager();
      const { panel = activePanel, item = null } = options;
      this[panel.sheetRange].selected = item;
    },
    setSelectedItemByKeyValue(key: string, value: string, panelObject?: Panel) {
      const { panel: activePanel } = useSheetManager();
      const panel = panelObject ?? activePanel;
      const item = this[panel.sheetRange].list.find(item => item[key] === value);
      if (item) {
        this[panel.sheetRange].selected = item;
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
        this[panel.sheetRange].selected = item;
        return item;
      } else {
        return null;
      }
    },
    removeItemFromCacheBySysId(sysId: string, panelObject?: Panel) {
      const { panel: activePanel } = useSheetManager();
      const panel = panelObject ?? activePanel;
      const index = this[panel.sheetRange].list.findIndex(item => item.sysId === sysId);

      if (index !== -1) {
        this[panel.sheetRange].list.splice(index, 1);
      }

      if (this[panel.sheetRange].selected?.sysId === sysId) {
        this[panel.sheetRange].selected = null;
      }
    },
    async deleteItem(options: DeleteItem = {}) {
      const { panel: activePanel } = useSheetManager();
      const syncState = useSyncState();
      const { setProcessing, waitUntilSynced } = syncState;
      const { processing } = storeToRefs(syncState);

      const {
        panel = activePanel,
        item = this[panel.sheetRange].selected,
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
        this.removeItemFromCacheBySysId(item.sysId, panel);
        return;
      }

      if (showWarning) {
        try {
          await warn()
        } catch {
          return
        }
      }

      if (!concurrent && processing.value) {
        await waitUntilSynced({ showDialog: true });
      }
      const { sysId, row } = item;

      setProcessing(true);
      if (typeof row === "number") {
        this.removeItemFromCacheBySysId(sysId, panel);
        await clearByRow(panel.sheetRange, row);
      } else {
        console.error("useDocumentCache: deleteItem started processing without an assigned row!");
      }

      useSyncState().$reset();
    },
    async addItem(options: AddItem = {}) {
      const { setSearchFilter, panel: activePanel, newSysId, setPinnedItem } = useSheetManager();
      const {
        panel = activePanel,
        pin = true,
        postToSheet = false,
        columns = null,
      } = options;

      setSearchFilter("");

      const [newItem] = await panel.mappers.map([
        columns ?? [newSysId()]
      ]);
      newItem.row = null;

      this[panel.sheetRange].selected = newItem;
      this[panel.sheetRange].list.unshift(newItem);

      if (pin) {
        setPinnedItem(newItem);
      }

      if (postToSheet) {
        useSyncState().setProcessing(true);
        const row = await postInRange(
          panel.sheetRange,
          await panel.mappers.unmap([newItem])
        )
        newItem.row = row
        useSyncState().$reset();
      }

      return newItem;
    },
    async updateItem(options: UpdateItem = {}) {
      const { panel: activePanel } = useSheetManager();
      const { setProcessing } = useSyncState();

      const {
        panel = activePanel,
        item = this[activePanel.sheetRange].selected,
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
        item.row = row
        useSyncState().$reset();
        return;
      }

      const itemInList = this[panel.sheetRange].list.find((listItem) => listItem.sysId === item.sysId);
      if (itemInList) {
        Object.assign(itemInList, item);
      } else {
        console.error("useDocumentCache: Item not in list");
        return;
      }

      setProcessing(true);

      await updateByRow(
        panel.sheetRange,
        item.row,
        await panel.mappers.unmap([item])
      )

      useSyncState().$reset();
    },
    async moveItemBetweenLists({ oldItem, newItem, oldPanel, newPanel }: MoveItemBetweenLists) {
      const { waitUntilSynced } = useSyncState();
      if (typeof oldItem.row !== "number") {
        return Promise.reject("useDocumentCache: Cannot move item that hasn't been saved to the sheet yet");
      }
      await waitUntilSynced({ showDialog: true });
      await this.deleteItem({
        item: oldItem,
        panel: oldPanel,
        showWarning: false,
      })
      await postInRange(
        newPanel.sheetRange,
        await newPanel.mappers.unmap([newItem])
      )
      this[newPanel.sheetRange].list.unshift(newItem);
    }
  }
})