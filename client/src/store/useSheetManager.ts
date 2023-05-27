import { defineStore } from 'pinia'

export const useSheetManager = defineStore('sheetManager', {
  state: () => ({
    selectedItem: null,
    panel: null,
    items: [],
  }),
  actions: {
    setPanel(panel) {
      this.panel = panel;
    }
  }