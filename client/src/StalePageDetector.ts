import { useDocumentCache } from "./store/useDocumentCache"
import { useAuth } from "./store/useAuth"
import { useSyncState } from "./store/useSyncState"
import { onUnmounted, ref, watch } from "vue"
import { local } from "./Locals"

export const useStalePageDetector = () => {
  const pageVisible = ref(true)

  const pageVisibleAction = async () => {

  }

  const pageHiddenAction = () => {

  }

  watch(pageVisible, (visible) => {
    if (visible) {
      pageVisibleAction()
    } else {
      pageHiddenAction()
    }
  })

  const onVisibilityChange = async () => {
    pageVisible.value = document.visibilityState === "visible"
  }

  window.addEventListener("visibilitychange", onVisibilityChange)

  onUnmounted(() => {
    window.removeEventListener("visibilitychange", onVisibilityChange)
  })
}