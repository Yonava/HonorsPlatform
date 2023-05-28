import { onUnmounted } from "vue"

type KeyBindings = { [key: string]: () => void }

export function useKeyBindings(bindings: KeyBindings, caseSensitive = false) {
  document.addEventListener("keydown", (e) => keyBindings(e, bindings, caseSensitive))
  onUnmounted(() => {
    document.removeEventListener("keydown", (e) => keyBindings(e, bindings, caseSensitive))
  })
}

function keyBindings(e: KeyboardEvent, bindings: KeyBindings, caseSensitive: boolean) {
  if (document.activeElement !== document.body) {
    return
  }
  const key = caseSensitive ? e.key : e.key.toLowerCase()
  if (!bindings[key]) {
    return
  }
  e.preventDefault()
  bindings[key]()
}