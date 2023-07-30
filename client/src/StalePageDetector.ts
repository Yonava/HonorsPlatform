import { useDocumentCache } from "./store/useDocumentCache"
import { useAuth } from "./store/useAuth"
import { onUnmounted } from "vue"

export const useStalePageDetector = () => {
  const { createSocketConnection, socket, destroySocketConnection } = useAuth()
  const { getAllDocuments } = useDocumentCache()

  const onVisibilityChange = async () => {
    if (document.visibilityState === "visible") {
      await getAllDocuments({
        showLoading: false,
      })

      if (!socket?.connected) {
        console.log("Reconnecting socket")
        await createSocketConnection()
      }
    }
  }

  window.addEventListener("visibilitychange", onVisibilityChange)

  onUnmounted(() => {
    window.removeEventListener("visibilitychange", onVisibilityChange)
  })
}