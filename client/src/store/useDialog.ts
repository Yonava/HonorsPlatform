import { defineStore } from "pinia";
import { markRaw } from "vue";
import { Panel } from "../Panels";
import { useSheetManager } from "./useSheetManager";

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

export const useDialog = defineStore("dialog", {
  state: () => ({
    panelCover: {} as Record<Panel['title']['plural'], boolean>,
    show: false,
    body: {
      title: "",
      description: "",
      buttons: []
    } as DialogBody,
    component: null,
    contentTimeout: null as any
  }),
  getters: {
    getPanelCover(state) {
      const { getActivePanel } = useSheetManager();
      return state.panelCover[getActivePanel.title.plural];
    }
  },
  actions: {
    setPanelCover(action: 'open' | 'close' | 'toggle', panelObject?: Panel) {
      const { getActivePanel } = useSheetManager();
      const panel = panelObject ?? getActivePanel;
      if (action === 'open') {
        this.panelCover[panel.title.plural] = true;
      } else if (action === 'close') {
        this.panelCover[panel.title.plural] = false;
      } else if (action === 'toggle') {
        this.panelCover[panel.title.plural] = !this.panelCover[panel.title.plural];
      }
    },
    open(options?: { body?: DialogBody; component?: any }) {
      if (this.show) {
        this.close();
        setTimeout(() => {
          this.open(options);
        }, 500)
        return;
      }
      clearTimeout(this.contentTimeout);
      if (options?.component) {
        this.component = markRaw(options.component);
      } else if (options?.body) {
        this.body = options.body;
      }
      this.show = true;
    },
    close() {
      this.show = false;
      clearInterval(this.contentTimeout);
      this.contentTimeout = setTimeout(() => {
        this.$reset();
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