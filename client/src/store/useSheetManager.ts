import { defineStore } from 'pinia'
import { getEvery, clearByRow } from '../SheetsAPI';
import { SheetItem } from '../SheetTypes';
import { panels, Panel } from '../Panels';
import router from '../router';

export const useSheetManager = defineStore('sheetManager', {
  state: () => ({
    selectedItem: null as SheetItem | null,
    panel: panels['STUDENTS'] as Panel,
    items: [] as SheetItem[],
    loadingItems: false
  }),
  actions: {
    async setPanel(panel: Panel, jumpTo?: number) {
      this.selectedItem = null;
      this.panel = panel;
      localStorage.setItem('panelScrollY', '0');
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
    }
  }
})