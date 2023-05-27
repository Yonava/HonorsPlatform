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