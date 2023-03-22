import { onUnmounted } from "vue"

type KeyBindings = { [key: string]: () => void }

export function useKeyBindings(bindings: KeyBindings) {
  document.addEventListener("keydown", (e) => keyBindings(e, bindings))
  onUnmounted(() => {
    document.removeEventListener("keydown", (e) => keyBindings(e, bindings))
  })
}

function keyBindings(e: KeyboardEvent, bindings: KeyBindings) {
  if (document.activeElement !== document.body) return
  if (!bindings[e.key]) return
  e.preventDefault()
  bindings[e.key]()
}