import { onUnmounted } from "vue"

export function useKeyBindings(bindings: any) {
  document.addEventListener("keydown", (e) => keyBindings(e, bindings))
  onUnmounted(() => {
    document.removeEventListener("keydown", (e) => keyBindings(e, bindings))
  })
}

function keyBindings(e: KeyboardEvent, bindings: any) {
  if (document.activeElement !== document.body) return
  if (!bindings[e.key]) return
  e.preventDefault()
  bindings[e.key]()
}