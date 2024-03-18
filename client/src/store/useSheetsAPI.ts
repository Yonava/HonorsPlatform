import { defineStore } from "pinia";
import * as API from '../SheetsAPI'

export type Range = "Students" | "Modules" | "Graduates" | "Completed Modules" | "Announcements" | "Grad Engagements" | "Registrar List" | "Theses" | "Temporary Data";

export const useSheetsAPI = defineStore('sheetsAPI', {
  state: () => ({
    headerRowCache: {} as Record<Range, string[]>,
    requestsCompletedInLastMinute: 0,
    totalRequestsCompleted: 0,
    requestQueue: [] as ((...[]) => Promise<any>)[],
    isProcessingRequests: false,
  }),
  getters: {
    getHeaderRowCache: (state) => (range: Range) => {
      if (!state.headerRowCache[range]) {
        throw new Error("Header row cache miss for: " + range)
      }
      return state.headerRowCache[range] || [];
    },
    isProcessingRequests: (state) => {
      return state.isProcessingRequests;
    },
  },
  actions: {

    // functionName: getStudents, functionArgs: any[]

    // some sort of map: functionName: function

    // request should be a function that returns a promise that is resolved when the request has made it through the queue, it should be called with a string that maps to a function in the SheetsAPI file and any arguments that function takes
    async queueRequest(request: (...[]) => Promise<any>, ...args: any[]) {
      this.requestQueue.push(() => request(...args));
      await this.processRequestQueue();
    },
    async processRequestQueue() {
      if (this.isProcessingRequests) {
        return;
      }
    }
  }
})