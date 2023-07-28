import { useDocumentCache } from "./store/useDocumentCache"
import { useAuth } from "./store/useAuth"

export const useStalePageDetector = () => {
  const { createSocketConnection } = useAuth()
  const { getAllDocuments } = useDocumentCache()

  window.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") {
      await getAllDocuments({
        showLoading: false,
      })

      await createSocketConnection()
    }
  })
}