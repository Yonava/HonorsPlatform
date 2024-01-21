import { markRaw, type Component } from "vue";
import { defineStore } from "pinia";
import { Panel } from "@panels";
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
  img?: string;
  action?: {
    onClick: () => void,
    text: string,
  } | null;
  timeout?: number;
  closable?: boolean;
}

export type DialogBody = {
  title?: string;
  description?: string;
  buttons?: DialogButton[];
};

export type DialogComponent = {
  component: Component;
  props?: Record<string, any>;
};

type DialogInstanceBase = {
  persistent: boolean;
  onClose: (...args: any[]) => void;
  resolve: (...args: any[]) => void;
  reject: (...args: any[]) => void;
  id: string;
}

type DialogInstance = DialogInstanceBase & (DialogBody | DialogComponent);

type OpenOptions = {
  persistent?: boolean;
  onClose?: (...args: any[]) => void;
} & (DialogBody | DialogComponent);

export const CONTENT_TIMEOUT_DURATION_MS = 300;

export const useDialog = defineStore("dialog", {
  state: () => ({

    instance: null as DialogInstance | null,
    closing: false,
    show: false,

    panelCover: {} as Record<Panel['title']['plural'], PanelCoverData>,
    snackbar: {
      show: false,
      text: '',
      img: '',
      color: 'primary',
      action: null as DialogButton | null,
      timeout: 5000,
      closable: true
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
        img: options.img ?? '',
        text: options.text ?? '',
        color: options.color ?? '',
        action: options.action ?? null,
        timeout: options.timeout ?? 5000,
        closable: options.closable ?? true
      }
    },
    closeSnackbar() {
      this.snackbar.show = false;
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
    async open(options: OpenOptions) {

      await this.close();

      const {
        onClose = () => {},
        persistent = false,
      } = options

      const promise = {
        resolve: null as any,
        reject: null as any,
      }

      const instancePromise = new Promise((resolve, reject) => {
        promise.resolve = resolve;
        promise.reject = reject;
      })

      const newInstance = {
        persistent,
        onClose,
        resolve: promise.resolve,
        reject: promise.reject,
        id: Math.random().toString(36).substring(2, 9),
      } as const

      if ('component' in options) {
        this.instance = {
          component: markRaw(options.component),
          props: options.props ?? {},
          ...newInstance,
        };
      } else {
        this.instance = {
          title: options.title ?? "",
          description: options.description ?? "",
          buttons: options.buttons ?? [],
          ...newInstance,
        };
      }

      this.show = true;

      return instancePromise;
    },
    async close(options: { onCloseArgs?: any[], resolveWith?: any } = {}) {
      if (!this.instance || this.closing) return;
      const {
        onCloseArgs = [],
        resolveWith = `DIALOG_INSTANCE_${this.instance.id}_CLOSED`
      } = options;
      this.closing = true;
      const { resolve, onClose } = this.instance;
      this.show = false;
      await new Promise(res => setTimeout(res, CONTENT_TIMEOUT_DURATION_MS));
      onClose(...onCloseArgs);
      resolve(resolveWith);
      this.closing = false;
      this.instance = null;
    }
  }
});