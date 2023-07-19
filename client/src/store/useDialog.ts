import { defineStore } from "pinia";
import { markRaw } from "vue";
import { Panel } from "../Panels";
import { useSheetManager } from "./useSheetManager";
import type { DeletionOutput } from "../DeleteSuggestions";
import type { SheetItem } from "../SheetTypes";

const defaultPanelCover = (show: boolean = false): PanelCoverData => {
  return {
    show,
    filter: '',
    selectedForDelete: [],
    deletionItems: [],
    loading: false
  }
}

export type DialogButton = {
  text: string;
  onClick: () => void;
  color?: string;
};

export type DialogBody = {
  title?: string;
  description?: string;
  buttons?: DialogButton[];
};

export type DialogComponent = {
  render: any;
  props?: any;
};

type PanelCoverData = {
  show: boolean;
  filter: string;
  selectedForDelete: string[];
  deletionItems: DeletionOutput<SheetItem>[];
  loading: boolean;
}

export const useDialog = defineStore("dialog", {
  state: () => ({
    panelCover: {} as Record<Panel['title']['plural'], PanelCoverData>,
    show: false,
    body: {
      title: "",
      description: "",
      buttons: []
    } as DialogBody,
    component: {
      render: null,
      props: {}
    } as DialogComponent | null,
    contentTimeout: null as any
  }),
  getters: {
    getPanelCover(state) {
      const { getActivePanel } = useSheetManager();
      return state.panelCover[getActivePanel.title.plural] ?? defaultPanelCover();
    },
    getListOfFlaggedItems(state) {
      const { getActivePanel } = useSheetManager();
      return state.panelCover[getActivePanel.title.plural].deletionItems.filter(item => item.status !== "success");
    }
  },
  actions: {
    setPanelCover(action: 'open' | 'close', panelObject?: Panel) {
      const { getActivePanel } = useSheetManager();
      const panel = panelObject ?? getActivePanel;
      if (action === 'open') {
        this.panelCover[panel.title.plural] = defaultPanelCover(true);
      } else if (action === 'close') {
        this.panelCover[panel.title.plural] =  defaultPanelCover();
      }
    },
    open(options?: { body?: DialogBody; component?: DialogComponent }) {
      if (this.show) {
        this.close();
        setTimeout(() => {
          this.open(options);
        }, 500)
        return;
      }
      clearTimeout(this.contentTimeout);
      if (options?.component) {
        this.component = {
          render: markRaw(options.component.render),
          props: options.component?.props ?? {}
        }
      } else if (options?.body) {
        this.body = options.body;
      }
      this.show = true;
    },
    close() {
      this.show = false;
      clearInterval(this.contentTimeout);
      this.contentTimeout = setTimeout(() => {
        this.component = null;
        this.body = {
          title: "",
          description: "",
          buttons: []
        };
      }, 300);
    },
    toggle(options?: { body?: DialogBody; component?: any }) {
      if (this.show) {
        this.close();
      } else {
        this.open(options);
      }
    }
  }
});