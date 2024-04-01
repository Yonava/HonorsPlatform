import { defineStore } from 'pinia'
import type { SheetItem } from '@apptypes/sheetItems';
import { getPanel, type PanelName } from '@panels';
import { useDocumentCache } from '@store/useDocumentCache';
import { useSocket } from '@store/useSocket';
import { local, localKeys } from '@locals';
import { filterItems } from '@utils/FilterObjects';
import router from '../router';
import type { SortOption } from '../SortOptions';
import { readonlySnackbar } from '../ReadonlyModeSnackbars';

export type JumpObject = {
  value: string,
  key?: string, // defaults to 'sysId'
  fallbackFn?: () => void // If the item you are jumping to is not found, this function will be called
};

type SheetManagerState = {
  panelSwitchDebounce: number
  panelSwitchCooldown: boolean
  panel: ReturnType<typeof getPanel>
  searchFilter: string
  pinnedSysIds: string[]
  loadingItems: boolean
  sort: SortOption
  listItemBeingDragged: SheetItem | null
  focusedItemSysId: string
  focusedEmbeddedItem: SheetItem | null
  readOnlyMode: boolean
}

export const useSheetManager = defineStore('sheetManager', {
  state: () => ({
    panelSwitchDebounce: 250,
    panelSwitchCooldown: true,
    panel: getPanel('STUDENTS'),
    searchFilter: '',
    pinnedSysIds: [],
    loadingItems: false,
    sort: {
      func: null,
      ascending: true,
      prop: '',
      label: ''
    },
    listItemBeingDragged: null,
    focusedItemSysId: '',
    focusedEmbeddedItem: null,
    readOnlyMode: false
  } as SheetManagerState),
  getters: {
    filteredItems(state) {
      if (state.loadingItems) {
        return [];
      }

      const documents = useDocumentCache();
      const outputArray = [...documents[state.panel.sheetRange].list];

      for (const pinnedSysId of state.pinnedSysIds) {
        const pinnedItemIndex = outputArray.findIndex((item) => pinnedSysId === item.sysId)
        if (pinnedItemIndex === -1) {
          continue
        }
        const pinnedItem = outputArray[pinnedItemIndex]
        outputArray.splice(pinnedItemIndex, 1)
        outputArray.unshift(pinnedItem)
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
      const { panel } = state
      if (!('embedded' in panel)) {
        return null
      }
      const { panel: embeddedPanelName } = panel?.embedded
      return getPanel(embeddedPanelName)
    },
    getPinnedItem: (state) => (item: SheetItem) => {
      return state.pinnedSysIds.find((sysId) => item.sysId === sysId)
    },
    getFocusedItem: (state) => {
      const documents = useDocumentCache();
      const { selected: selectedItems } = documents[state.panel.sheetRange];
      return selectedItems.find((item) => item.sysId === state.focusedItemSysId) as SheetItem | undefined;
    },
  },
  actions: {
    setReadOnlyMode(readOnly: boolean) {
      this.readOnlyMode = readOnly
      readOnly ? readonlySnackbar().activated() : readonlySnackbar().deactivated()
    },
    toggleReadOnlyMode() {
      this.readOnlyMode = !this.readOnlyMode
      this.readOnlyMode ? readonlySnackbar().activated() : readonlySnackbar().deactivated()
    },
    setSearchFilter(filter: string) {
      this.searchFilter = filter;
    },
    async setPanel(panelName: PanelName, jumpTo?: JumpObject) {
      if (!this.panelSwitchCooldown) {
        return;
      }

      this.panelSwitchCooldown = false;

      const { setSelectedItems, getAllDocuments } = useDocumentCache();

      setSelectedItems({
        items: []
      });

      this.panel = getPanel(panelName);
      this.pinnedSysIds = local.get(localKeys.pinned(panelName))?.split(',') || []
      this.setSearchFilter('');

      this.clearSort();

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

      const { emitUserFocus } = useSocket()
      emitUserFocus()

      setTimeout(() => {
        this.panelSwitchCooldown = true;
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
        console.error('jumpToItem: item not found');
        fallbackFn()
      }
    },
    setPinnedItem({ items = [] }: { items: SheetItem[] }) {
      this.pinnedSysIds = items.map((item) => item.sysId);
    },
    addPinnedItem(item: SheetItem) {
      this.pinnedSysIds.push(item.sysId)
    },
    removePinnedItem(item: SheetItem) {
      const pinnedItemIndex = this.pinnedSysIds.findIndex((sysId) => {
        return item.sysId === sysId
      })
      if (pinnedItemIndex === -1) {
        console.warn(`useSheetManager removePinnedItem: ${item.sysId} does not exist in pinned items`)
        return
      }
      this.pinnedSysIds.splice(pinnedItemIndex, 1)
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

      itemsOnActivePanel.sort(sortObject.func);

      if (!sortObject.ascending) {
        itemsOnActivePanel.reverse();
      }
    },
    clearSort() {
      this.sort = {
        func: null,
        ascending: true,
        prop: '',
        label: ''
      };
    },
    setFocusedItem(sysId: string) {
      this.focusedItemSysId = sysId
      const { emitUserFocus } = useSocket()
      emitUserFocus()
    },
    setFocusedEmbeddedItem(item: SheetItem | null) {
      this.focusedEmbeddedItem = item
      const { emitUserFocus } = useSocket()
      emitUserFocus()
    }
  }
})