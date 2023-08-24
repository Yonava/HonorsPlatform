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

type SnackbarOptions = {
  text?: string;
  color?: string;
  action?: {
    onClick: () => void,
    text: string,
  } | null;
  timeout?: number;
  closeable?: boolean;
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
    component: null as DialogComponent | null,
    persistent: false,
    contentTimeout: null as any,
    contentTimeoutDuration: 300,
    snackbar: {
      show: false,
      text: '',
      color: 'primary',
      action: null as DialogButton | null,
      timeout: 5000,
      closeable: true
    }
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
    openSnackbar(options: SnackbarOptions = {}) {
      this.snackbar = {
        show: true,
        text: options.text ?? '',
        color: options.color ?? '',
        action: options.action ?? null,
        timeout: options.timeout ?? 5000,
        closeable: options.closeable ?? true
      }
    },
    closeSnackbar() {
      this.snackbar.show = false;
    },
    setPersistent(persistent: boolean) {
      this.persistent = persistent;
    },
    setPanelCover(action: 'open' | 'close', panelObject?: Panel) {
      const { getActivePanel } = useSheetManager();
      const panel = panelObject ?? getActivePanel;
      if (action === 'open') {
        this.panelCover[panel.title.plural] = defaultPanelCover(true);
      } else if (action === 'close') {
        this.panelCover[panel.title.plural] =  defaultPanelCover();
      }
    },
    open(options?: { body?: DialogBody; component?: DialogComponent, persistent?: boolean }) {

      this.setPersistent(options?.persistent ?? false);
      if (this.show && !this.persistent) {

        // if the dialog that is already open is the same as the one we're trying to open, don't do anything
        if (this.body.title === options?.body?.title || this.component?.render === options?.component?.render) {
          return;
        }

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
      }, this.contentTimeoutDuration);
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