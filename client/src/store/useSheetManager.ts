import { defineStore } from 'pinia'
import { SheetItem } from '../SheetTypes';
import { getPanel, PanelName, panels } from '../Panels';
import router from '../router';
import { filterItems } from '../FilterObjects';
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

export const useSheetManager = defineStore('sheetManager', {
  state: () => ({
    panelSwitchDebounce: 250,
    canPanelSwitch: true,
    panel: getPanel(Object.keys(panels)[0] as PanelName),
    searchFilter: '',
    pinnedItem: null as SheetItem | null,
    loadingItems: false,
    sort: {
      func: null as ((a: SheetItem, b: SheetItem) => number) | null,
      ascending: true
    } as SortOption,
    listItemBeingDragged: null as SheetItem | null,
    focusedItem: null as SheetItem | null,
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
      return filterItems(outputArray, state.searchFilter);
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
      if (!this.canPanelSwitch) {
        return;
      }

      this.canPanelSwitch = false;

      const { setSelectedItems, getAllDocuments } = useDocumentCache();
      setSelectedItems();
      this.panel = getPanel(panelName);

      this.setPinnedItem(null);
      this.setSearchFilter('');

      this.sort = {
        func: null,
        ascending: true
      };

      getAllDocuments({
        showLoading: false
      })

      document.title = this.panel.title.plural + ' - Honors Program';
      router.push({
        name: 'panel',
        query: {
          type: this.panel.title.plural.toLowerCase()
        }
      });

      if (jumpTo) {
        this.jumpToItem(jumpTo);
      }

      setTimeout(() => {
        this.canPanelSwitch = true;
      }, this.panelSwitchDebounce);
    },
    async jumpToItem({ key = 'sysId', value, fallbackFn = () => null }: JumpObject) {
      const { setSelectedItemByKeyValue, cacheRefreshInProgress } = useDocumentCache();

      if (cacheRefreshInProgress) {
        await cacheRefreshInProgress;
      }

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
    setLoadingItems(loading: boolean) {
      this.loadingItems = loading;
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