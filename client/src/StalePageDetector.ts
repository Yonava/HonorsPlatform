import { useDocumentCache } from "./store/useDocumentCache"
import { useAuth } from "./store/useAuth"
import { onUnmounted } from "vue"

export const useStalePageDetector = () => {
  const { createSocketConnection, socket } = useAuth()
  const { getAllDocuments } = useDocumentCache()

  const onVisibilityChange = async () => {
    if (document.visibilityState === "hidden") {
      return
    }

    await getAllDocuments({
      showLoading: false,
      forceCacheRefresh: !socket?.connected,
    })

    if (!socket?.connected) {
      console.log("Reconnecting socket")
      await createSocketConnection()
    }
  }

  window.addEventListener("visibilitychange", onVisibilityChange)

  onUnmounted(() => {
    window.removeEventListener("visibilitychange", onVisibilityChange)
  })
}