import { defineStore } from "pinia";
import * as api from "../SheetsAPI";
import * as types from "../SheetTypes";
import * as panels from "../Panels";


export const useDocumentCache = defineStore("documentCache", {
  state: () => ({
    documents: {
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
    } as Record<api.Range, { list: types.SheetItem[], selected: types.SheetItem | null }>,
  }),
  getters: {
    getDocument: (state) => (range: api.Range, sysId: string) => {
      return state.documents[range].list.find((document) => document.sysId === sysId);
    },
    getDocuments: (state) => (range: api.Range) => {
      return state.documents[range].list;
    }
  },
  actions: {
    async refreshCache(panel: panels.Panel) {
      const range = panel.sheetRange;
      const data = await api.getEvery(range);
      const documents = await panel.mappers.map(data);
      this.documents[range].list = documents;
      return documents;
    }
  }
});