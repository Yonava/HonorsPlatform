import { onMounted } from 'vue'
import type { Ref } from 'vue'

type InputFocusOptions = {
  focusOnMounted?: boolean,
  delayMs?: number
}

export function useInputFocus(el: Ref<HTMLElement>, options: InputFocusOptions = {}) {
  const {
    focusOnMounted = false,
    delayMs = 250
  } = options

  const focus = () => setTimeout(() => el.value?.focus(), delayMs)

  if (focusOnMounted) {
    onMounted(focus)
  }

  return { focus }
}

export function useAutoFocus(el: Ref<HTMLElement>) {
  return useInputFocus(el, { focusOnMounted: true })
}