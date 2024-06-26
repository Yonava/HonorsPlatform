import { markRaw } from "vue";
import type { Component } from "vue";
import { defineStore } from "pinia";
import { Panel } from "@panels";
import { useSheetManager } from "@store/useSheetManager";
import type { SheetItem } from "@apptypes/sheetItems";
import type { DeletionOutput } from "../DeleteSuggestions";

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
  onClick: () => void;
  text: string;
  color?: string;
};

type PanelCoverData = {
  show: boolean;
  filter: string;
  selectedForDelete: string[];
  deletionItems: DeletionOutput<SheetItem>[];
  loading: boolean;
}

type Snackbar = {
  text: string;
  img: string;
  color: string;
  action: DialogButton;
  timeout: number;
  closable: boolean;
}

type SnackbarOptions = Partial<Snackbar>;

type DialogBody = {
  title: string;
  description: string;
  buttons: DialogButton[];
}

export type DialogBodyOptions = Partial<DialogBody>

export type DialogComponentOptions = {
  component: Component;
  props?: Record<string, any>;
};

export type DialogContentOptions = DialogBodyOptions | DialogComponentOptions;

type DialogCloseResolutions = 'BACKGROUND_CLOSE' | 'ACTION_CLOSE'

type DialogInstanceBase<T> = {
  persistent: boolean;
  onClose: (...args: any[]) => void;
  resolve: (reason: T) => void;
  reject: (...args: any[]) => void;
  id: string;
}

type DialogInstance<T = DialogCloseResolutions> = DialogInstanceBase<T> & DialogContentOptions;

type OpenOptions = {
  persistent?: boolean;
  onClose?: (...args: any[]) => void;
} & DialogContentOptions;

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
      const {
        action = null,
        img = '',
        text = '',
        color = '',
        timeout = 5000,
        closable = !options.action,
      } = options;

      this.snackbar = {
        show: true,
        action,
        img,
        text,
        color,
        timeout,
        closable
      }
    },
    closeSnackbar() {
      this.snackbar.show = false;
    },
    setPanelCover(action: 'open' | 'close', panelObject?: Panel) {
      const { getActivePanel } = useSheetManager();
      const panel = panelObject ?? getActivePanel;
      this.panelCover[panel.title.plural] = defaultPanelCover(action === 'open');
    },
    async open<T = DialogCloseResolutions>(options: OpenOptions) {

      await this.close();

      const {
        onClose = () => {},
        persistent = false,
      } = options

      const promise: Record<string, any> = {
        resolve: () => {},
        reject: () => {},
      }

      const instancePromise = new Promise<DialogCloseResolutions | T>((resolve, reject) => {
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
    async close(options: { onCloseArgs?: any[], resolveWith?: DialogCloseResolutions } = {}) {
      if (!this.instance || this.closing) return;
      const {
        onCloseArgs = [],
        resolveWith = 'ACTION_CLOSE'
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