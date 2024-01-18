import { onUnmounted } from "vue"

type KeyBindings = { [key: string]: () => void }

export function useKeyBindings(bindings: KeyBindings, caseSensitive = false) {
  const action = (e: KeyboardEvent) => keyBindings(e, bindings, caseSensitive)
  document.addEventListener("keydown", action)
  const killListeners = () => document.addEventListener("keydown", action)
  onUnmounted(killListeners)
  return killListeners
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