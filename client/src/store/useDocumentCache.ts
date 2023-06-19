import { defineStore } from "pinia";
import { getEvery, clearByRow, updateByRow, postInRange, moveRowToRange } from '../SheetsAPI';
import * as types from "../SheetTypes";
import * as panels from "../Panels";
import { useSheetManager } from "./useSheetManager";
import { warn } from "../Warn";
import { useSyncState } from "./useSyncState";

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
    getSelectedItem: (state) => (panelObject?: panels.Panel) => {
      const { panel: activePanel } = useSheetManager();
      const panel = panelObject ?? activePanel;
      return state[panel.sheetRange].selected;
    },
    dueForRefresh: (state) => (panelObject?: panels.Panel) => {
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
    async refreshCache(panelObject?: panels.Panel) {

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
      return documents;
    },
    async refreshAll() {
      for (const panel of Object.keys(panels.panels) as (keyof typeof panels.panels)[]) {
        await this.refreshCache(panels.panels[panel]);
      }
    },
    setSelectedItem(item: types.SheetItem | null, panelObject?: panels.Panel) {
      const { panel: activePanel } = useSheetManager();
      const panel = panelObject ?? activePanel;
      this[panel.sheetRange].selected = item;
    },
    setSelectedItemBySysId(sysId: string, panelObject?: panels.Panel) {
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
    removeItemFromCacheBySysId(sysId: string, panelObject?: panels.Panel) {
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
    async deleteItem(item?: types.SheetItem, panelObject?: panels.Panel, showWarning = true) {
      const { panel: activePanel } = useSheetManager();
      const { setProcessing } = useSyncState();

      const panel = panelObject ?? activePanel;
      const itemToDelete = item ?? this[panel.sheetRange].selected;
      if (!itemToDelete) {
        console.error("useDocumentCache: No item to delete");
        return;
      }
      const { sysId, row } = itemToDelete;

      // no row means it's a new item that hasn't been saved to the sheet yet
      if (typeof row !== "number") {
        console.log("useDocumentCache: No row to delete, not hitting API");
        this.removeItemFromCacheBySysId(sysId, panel);
        return;
      }

      if (showWarning) {
        try {
          await warn()
        } catch {
          return
        }
      }

      setProcessing(true);

      this.removeItemFromCacheBySysId(sysId, panel);
      await clearByRow(panel.sheetRange, row);

      useSyncState().$reset();
    },
    async addItemToCache(panelObject?: panels.Panel, pin = true, columns?: any[]) {

      console.log('adding item to cache', panelObject?.sheetRange, pin, columns)

      const { setSearchFilter, panel: activePanel, newSysId, setPinnedItem } = useSheetManager();
      setSearchFilter("");

      const panel = panelObject ?? activePanel;

      const [newItem] = await panel.mappers.map([
        columns ?? [newSysId()]
      ]);
      newItem.row = null;

      this[panel.sheetRange].selected = newItem;
      this[panel.sheetRange].list.unshift(newItem);

      if (pin) {
        setPinnedItem(newItem);
      }

      // if columns is overwritten, immediately update the item
      if (columns) {
        await this.updateItem(newItem, panel);
      }

      return newItem;
    },
    async updateItem(item?: types.SheetItem, panelObject?: panels.Panel) {
      const { panel: activePanel } = useSheetManager();
      const { setProcessing } = useSyncState();

      const panel = panelObject ?? activePanel;
      const itemToUpdate = item ?? this[panel.sheetRange].selected;

      if (!itemToUpdate) {
        console.error("useDocumentCache: No item to update");
        return;
      }

      const itemInList = this[panel.sheetRange].list.find(item => item.sysId === itemToUpdate.sysId);
      if (itemInList) {
        Object.assign(itemInList, itemToUpdate);
      } else {
        this[panel.sheetRange].list.unshift(itemToUpdate);
      }

      const { row } = itemToUpdate;
      setProcessing(true);

      if (typeof row !== "number") {
        const row = await postInRange(
          panel.sheetRange,
          await panel.mappers.unmap([itemToUpdate])
        )
        itemToUpdate.row = row
      } else {
        await updateByRow(
          panel.sheetRange,
          row,
          await panel.mappers.unmap([itemToUpdate])
        )
      }

      useSyncState().$reset();
    },
    async moveItemBetweenLists(oldItem: types.SheetItem, newItem: types.SheetItem, oldPanel: panels.Panel, newPanel: panels.Panel) {
      await this.deleteItem(oldItem, oldPanel, false);
      await postInRange(
        newPanel.sheetRange,
        await newPanel.mappers.unmap([newItem])
      )
      this[newPanel.sheetRange].list.unshift(newItem);
    }}
});