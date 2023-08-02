import { useDocumentCache } from "./store/useDocumentCache"
import { useAuth } from "./store/useAuth"
import { onUnmounted, ref, watch } from "vue"
import { local } from "./Locals"

export const useStalePageDetector = () => {
  const { createSocketConnection, destroySocketConnection } = useAuth()
  const { getAllDocuments } = useDocumentCache()
  const pageVisible = ref(true)

  const pageVisibleAction = async () => {
    console.log("Page is visible, refreshing")
    await createSocketConnection()
    await getAllDocuments({
      showLoading: false,
      forceCacheRefresh: true,
    })
  }

  const pageHiddenAction = () => {
    console.log("Page is hidden, disconnecting socket")
    destroySocketConnection()
  }

  let timeout = setTimeout(() => {})
  watch(pageVisible, () => {

    clearTimeout(timeout)

    // if last auth was less that 15 seconds ago, don't do anything
    const lastAuth = localStorage.getItem(local.timeSinceLastAuth)

    if (lastAuth) {
      const lastAuthDate = new Date(lastAuth)
      const now = new Date()
      const diff = now.getTime() - lastAuthDate.getTime()
      const seconds = diff / 1000
      if (seconds < 15) {
        console.log("Last auth was less than 15 seconds ago, not doing anything")
        return
      }
    }

    timeout = setTimeout(() => {
      // page visible action
      if (pageVisible.value) {
        pageVisibleAction()
      } else {
        // page hidden action
        pageHiddenAction()
      }
    }, 5000)
  })

  const onVisibilityChange = async () => {
    pageVisible.value = document.visibilityState === "visible"
  }

  window.addEventListener("visibilitychange", onVisibilityChange)

  onUnmounted(() => {
    window.removeEventListener("visibilitychange", onVisibilityChange)
  })
}