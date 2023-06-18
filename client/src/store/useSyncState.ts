import { defineStore } from 'pinia';

export const useSyncState = defineStore('syncState', {
  state: () => ({
    processing: false,
    lastSynced: new Date()
  }),
  getters: {
    syncing: (state) => state.processing,
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
    setLastSynced(date: Date = new Date()) {
      this.lastSynced = date;
    }
  }
})