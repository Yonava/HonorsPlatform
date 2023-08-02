import { useAuth } from "./store/useAuth"
import { onUnmounted, ref, watch } from "vue"
import { local } from "./Locals"

export const useStalePageDetector = () => {
  const pageVisible = ref(true)
  const { createSocketConnection, destroySocketConnection } = useAuth()

  const pageVisibleAction = async () => {
    const { socket } = useAuth()
    if (!socket?.connected) {
      await createSocketConnection()
    }
  }

  const pageHiddenAction = () => {
    destroySocketConnection()
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