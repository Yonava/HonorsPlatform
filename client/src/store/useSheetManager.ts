import { defineStore } from 'pinia'
import { SheetItem } from '../SheetTypes';
import { getPanel, Panel } from '../Panels';
import router from '../router';
import { useSyncState } from './useSyncState';
import { useDocumentCache } from './useDocumentCache';

export type JumpObject = {
  sysId: string,
  fallbackFn?: () => void // If the item you are jumping to is not found, this function will be called
};

export type SortOption = {
  func: (a: SheetItem, b: SheetItem) => number,
  ascending: boolean
}

export const useSheetManager = defineStore('sheetManager', {
  state: () => ({
    panel: getPanel('STUDENTS'),
    searchFilter: '',
    pinnedItem: null as SheetItem | null,
    loadingItems: false,
    sort: {
      func: null as ((a: SheetItem, b: SheetItem) => number) | null,
      ascending: true
    } as SortOption
  }),
  getters: {
    filteredItems(state) {
      if (state.loadingItems) {
        return [];
      }
      const documents = useDocumentCache();
      const outputArray = [...documents[state.panel.sheetRange].list];
      if (state.pinnedItem) {
        const indexOfPinnedItem = outputArray.findIndex(item => item.sysId === state.pinnedItem?.sysId);
        if (indexOfPinnedItem !== -1) {
          outputArray.splice(indexOfPinnedItem, 1);
          outputArray.unshift(state.pinnedItem);
        }
      }
      if (state.searchFilter === '') {
        return outputArray;
      }
      return outputArray.filter(item => {
        const query = state.searchFilter.toLowerCase();
        const values = Object.values(item).join(' ').toLowerCase();
        return values.includes(query)
      })
    },
    activeSort(state) {
      return state.sort;
    },
    getActivePanel(state) {
      return state.panel;
    }
  },
  actions: {
    setSearchFilter(filter: string) {
      this.searchFilter = filter;
    },
    async setPanel(panel: Panel, jumpTo?: JumpObject) {

      useDocumentCache().setSelectedItem(null);
      this.panel = panel;

      this.setPinnedItem(null);
      this.setSearchFilter('');

      this.sort = {
        func: null,
        ascending: true
      };

      document.title = panel.title.plural + ' - Honors Program';
      router.push({
        name: 'panel',
        query: {
          type: panel.title.plural.toLowerCase()
        }
      });

      await this.fetchItems();

      if (jumpTo) {
        this.jumpToItem(jumpTo.sysId, jumpTo.fallbackFn);
      }
    },
    async fetchItems(force = false) {
      const documents = useDocumentCache();
      const { refreshCache, dueForRefresh } = documents;
      this.loadingItems = true;
      if (dueForRefresh() || force) {
        await refreshCache();
      }
      this.setSort()
      this.loadingItems = false;
      useSyncState().$reset()
    },
    jumpToItem(sysId: string, fallbackFn?: () => void) {
      const { setSelectedItemBySysId } = useDocumentCache();
      const setItemSuccessfully = setSelectedItemBySysId(sysId)
      if (!setItemSuccessfully) {
        console.error('useStateManager: item not found');
        fallbackFn?.()
      }
    },
    setPinnedItem(item: SheetItem | null) {
      this.pinnedItem = item;
    },
    newSysId() {
      return Math.random().toString(36).substring(2, 15);
    },
    setSort(sortObject?: SortOption) {

      const documents = useDocumentCache();
      const { list: itemsOnActivePanel } = documents[this.panel.sheetRange];

      if (!sortObject) {
        sortObject = this.sort;
      }
      if (!sortObject.func) {
        console.warn('useStateManager (setSort): No sort function provided')
        return;
      }

      this.sort = sortObject;
      this.setPinnedItem(null);

      itemsOnActivePanel.sort(sortObject.func);

      if (!sortObject.ascending) {
        itemsOnActivePanel.reverse();
      }
    }
  }
})