import { defineStore } from 'pinia'
import { getEvery, clearByRow, postInRange, updateByRow } from '../SheetsAPI';
import { SheetItem } from '../SheetTypes';
import { getPanel, Panel } from '../Panels';
import router from '../router';
import { useSyncState } from './useSyncState';

export const useSheetManager = defineStore('sheetManager', {
  state: () => ({
    selectedItem: null as SheetItem | null,
    panel: getPanel('STUDENTS'),
    items: [] as SheetItem[],
    searchFilter: '',
    loadingItems: false
  }),
  getters: {
    filteredItems(state) {
      if (state.searchFilter === '') {
        return state.items;
      }
      return state.items.filter(item => {
        const query = state.searchFilter.toLowerCase();
        const values = Object.values(item).join(' ').toLowerCase();
        return values.includes(query)
      })
    }
  },
  actions: {
    setSearchFilter(filter: string) {
      this.searchFilter = filter;
    },
    setItems(items: SheetItem[]) {
      this.items = items;
    },
    async setPanel(panel: Panel, jumpTo?: { key: string, value: string }) {
      if (this.panel === panel) {
        return;
      }
      this.selectedItem = null;
      this.items = [];
      this.panel = panel;
      this.searchFilter = '';
      document.title = panel.title.plural + ' - Honors Program';
      router.push({
        name: 'panel',
        query: {
          type: panel.title.plural.toLowerCase()
        }
      });
      await this.fetchItems();
      if (jumpTo) {
        this.jumpToItem(jumpTo);
      }
    },
    async fetchItems() {
      this.loadingItems = true;
      this.items = [];
      const range = this.panel.sheetRange;
      const data = await getEvery(range);
      const items = await this.panel.mappers.map(data);
      this.items = items;
      this.selectedItem = this.items.find(item => item.row === this.selectedItem?.row) ?? null;
      this.loadingItems = false;
    },
    jumpToItem({ key, value }: { key: string, value: string }) {
      const item = this.items.find(item => item[key] === value);
      if (!item) {
        console.error('useStateManager: Could not find item to select');
        return;
      }
      this.selectedItem = item;
    },
    setItem(item: SheetItem | null) {
      this.selectedItem = item;
    },
    async deleteItem(item?: SheetItem) {
      if (!item) {
        if (!this.selectedItem) {
          console.error('useStateManager: No item selected for update');
          return;
        }
        item = this.selectedItem;
      }
      this.loadingItems = true
      const { row } = item
      if (item === this.selectedItem) {
        this.selectedItem = null
      }
      await clearByRow(this.panel.sheetRange, row)
      await this.fetchItems()
    },
    async postItem(itemDataArray: string[]) {
      this.loadingItems = true
      await postInRange(this.panel.sheetRange, [itemDataArray])
      await this.fetchItems()
    },
    async updateItem(item?: SheetItem) {
      if (!item) {
        if (!this.selectedItem) {
          console.error('useStateManager: No item selected for update');
          return;
        }
        item = this.selectedItem;
      }
      useSyncState().processing = true
      await updateByRow(this.panel.sheetRange, item.row, await this.panel.mappers.unmap([item]))
      useSyncState().$reset()
    }
  }
})