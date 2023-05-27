import { defineStore } from 'pinia'
import { getEvery, clearByRow, postInRange } from '../SheetsAPI';
import { SheetItem } from '../SheetTypes';
import { panels, Panel } from '../Panels';
import router from '../router';

export const useSheetManager = defineStore('sheetManager', {
  state: () => ({
    selectedItem: null as SheetItem | null,
    panel: panels['STUDENTS'] as Panel,
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
    async setPanel(panel: Panel, jumpTo?: number) {
      if (this.panel === panel) {
        return;
      }
      this.selectedItem = null;
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
      const range = this.panel.sheetRange;
      const data = await getEvery(range);
      const items = await this.panel.mappers.map(data);
      this.items = items;
    },
    jumpToItem(row: number) {
      const item = this.items.find(item => item.row === row);
      if (!item) {
        console.error('useStateManager: Could not find item to select');
        return;
      }
      this.selectedItem = item;
    },
    setItem(item: SheetItem | null) {
      this.selectedItem = item;
    },
    async deleteSelectedItem() {
      this.loadingItems = true
      if (!this.selectedItem) {
        console.error('useStateManager: No item selected');
        return;
      }
      const { row } = this.selectedItem
      this.selectedItem = null
      await clearByRow(this.panel.sheetRange, row)
      await this.fetchItems()
    },
    async postItem(itemDataArray: string[]) {
      this.loadingItems = true
      await postInRange(this.panel.sheetRange, [itemDataArray])
      await this.fetchItems()
    }
  }
})