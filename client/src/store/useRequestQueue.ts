import { defineStore } from "pinia";
import { useAuth } from "@store/useAuth";
import { ref } from "vue";

type QueueItem<T = any> = {
  promiseFn: () => Promise<T>,
  resolve: (value: T) => void,
  reject: (reason?: any) => void
}

export const useRequestQueue = defineStore('asyncQueue', () => {
  const queue = ref<QueueItem[]>([])
  const runningProcess = ref(false)

  const push = <T>(promiseFn: () => Promise<T>) => new Promise<T>((resolve, reject) => {
    queue.value.push({ promiseFn, resolve, reject })
    processQueue()
  })

  const processQueue = async () => {
    if (runningProcess.value) return
    runningProcess.value = true
    while (queue.value.length > 0) {
      const { promiseFn, resolve, reject } = queue.value.shift()!
      try {
        const result = await promiseFn()
        resolve(result)
      } catch (e) {
        reject(e)
      }
    }
    runningProcess.value = false
  }

  return { push }
})

export const requestWithRePrompt = async <T>(fn: (...args: any[]) => Promise<T>, ...args: any[]) => {
  try {
    return await useRequestQueue().push(() => fn(...args))
  } catch {
    await useAuth().authorizeBeforeContinuing()
    try {
      return await useRequestQueue().push(() => fn(...args))
    } catch (e) {
      useAuth().userLogoutFlow({
        error: 'NO_SHEET_ACCESS',
        goToAuthPage: true,
        broadcastLogoutEvent: false
      })
      throw e
    }
  }
}