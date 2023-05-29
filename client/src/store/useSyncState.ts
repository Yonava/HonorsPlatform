import { defineStore } from 'pinia';

export type SyncState = {
  status: boolean;
  processing: boolean;
  lastSynced: Date;
}

export const useSyncState = defineStore('syncState', {
  state: () => ({
    status: true,
    processing: false,
    lastSynced: new Date()
  }),
  getters: {
    inSync: (state) => state.status && !state.processing,
    syncTime: (state) => {
      const time = state.lastSynced.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }).toLowerCase();

      if (time.startsWith("0") && !time.startsWith("00")) {
        return time.slice(1);
      } else {
        return time;
      }
    }
  },
  actions: {
    setProcessing(processing: boolean) {
      this.processing = processing;
    },
    setStatus(status: boolean) {
      this.status = status;
    },
    setLastSynced(date: Date = new Date()) {
      this.lastSynced = date;
    }
  }
})