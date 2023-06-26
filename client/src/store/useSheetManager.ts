import { defineStore } from 'pinia'
import { SheetItem } from '../SheetTypes';
import { getPanel, PanelName, panels, Panel } from '../Panels';
import router from '../router';
import { useSyncState } from './useSyncState';
import { useDocumentCache } from './useDocumentCache';

export type JumpObject = {
  value: string,
  key?: string, // defaults to 'sysId'
  fallbackFn?: () => void // If the item you are jumping to is not found, this function will be called
};

export type SortOption = {
  func: (a: SheetItem, b: SheetItem) => number,
  ascending: boolean
}

type FetchItems = {
  showLoading?: boolean,
  forceCacheRefresh?: boolean,
  panelObject?: Panel,
  fetchEmbeddedPanelData?: boolean,
}

export const useSheetManager = defineStore('sheetManager', {
  state: () => ({
    panel: getPanel(Object.keys(panels)[0] as PanelName),
    searchFilter: '',
    pinnedItem: null as SheetItem | null,
    loadingItems: false,
    sort: {
      func: null as ((a: SheetItem, b: SheetItem) => number) | null,
      ascending: true
    } as SortOption,
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
    },
    getActiveEmbeddedPanel(state) {
      const embeddedPanel = getPanel(state.panel.embedded.panel)
      return embeddedPanel ?? null
    }
  },
  actions: {
    setSearchFilter(filter: string) {
      this.searchFilter = filter;
    },
    async setPanel(panelName: PanelName, jumpTo?: JumpObject) {
      const { setSelectedItem } = useDocumentCache();
      setSelectedItem();
      this.panel = getPanel(panelName);

      this.setPinnedItem(null);
      this.setSearchFilter('');

      this.sort = {
        func: null,
        ascending: true
      };

      document.title = this.panel.title.plural + ' - Honors Program';
      router.push({
        name: 'panel',
        query: {
          type: this.panel.title.plural.toLowerCase()
        }
      });

      await this.fetchItems();

      if (jumpTo) {
        this.jumpToItem(jumpTo);
      }
    },
    async fetchItems(options: FetchItems = {}) {
      const {
        showLoading = true,
        forceCacheRefresh = false,
        panelObject = this.panel,
        fetchEmbeddedPanelData = true
      } = options;

      const documents = useDocumentCache();
      const { refreshCache, dueForRefresh } = documents;

      if (showLoading) {
        this.loadingItems = true;
      }

      if (dueForRefresh(panelObject) || forceCacheRefresh) {
        await refreshCache(panelObject, fetchEmbeddedPanelData);
      }

      this.setSort()
      this.loadingItems = false;
      useSyncState().$reset()
    },
    async jumpToItem({ key = 'sysId', value, fallbackFn = () => null }: JumpObject) {
      // allows the UI to update on mobile and tablet breakpoints before jumping
      await new Promise(resolve => setTimeout(resolve, 100));
      const { setSelectedItemByKeyValue } = useDocumentCache();
      const success = setSelectedItemByKeyValue({
        key,
        value
      });
      if (!success) {
        console.error('useStateManager: item not found');
        fallbackFn()
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