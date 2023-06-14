import { defineStore } from "pinia";
import { markRaw } from "vue";

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
    show: false,
    body: {
      title: "",
      description: "",
      buttons: []
    } as DialogBody,
    component: null,
    contentTimeout: null as any
  }),
  actions: {
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