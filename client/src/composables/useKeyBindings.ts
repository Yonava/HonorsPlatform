import { onUnmounted } from "vue"

type KeyBindings = Record<string, () => void>

type KeyBindingOptions = {
  caseSensitive?: boolean
}

export function useKeyBindings(bindings: KeyBindings, options: KeyBindingOptions = {}) {
  const { caseSensitive = false } = options
  const action = (e: KeyboardEvent) => keyBindings(e, bindings, caseSensitive)
  document.addEventListener("keydown", action)
  const killListeners = () => document.removeEventListener("keydown", action)
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