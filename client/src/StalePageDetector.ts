import { onUnmounted, ref, watch } from "vue"
import { useSocket } from "./store/useSocket"

export const useStalePageDetector = () => {
  const pageVisible = ref(true)
  const { connect, disconnect } = useSocket()

  const pageVisibleAction = async () => {
    await connect()
  }

  const pageHiddenAction = () => {
    disconnect()
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