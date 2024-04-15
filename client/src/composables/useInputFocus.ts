import { onMounted } from 'vue'
import type { Ref } from 'vue'

export type InputFocusOptions = {
  focusOnMounted?: boolean,
  delayMs?: number
}

export function useInputFocus<T extends HTMLElement | null | undefined>(
  el: Ref<T>,
  options: InputFocusOptions = {}
) {

  const {
    focusOnMounted = false,
    delayMs = 25
  } = options

  const engageFocus = () => {
    if (!el.value) throw 'No element to focus on.'
    el.value.focus()
  }

  const focus = async () => {
    await new Promise(resolve => setTimeout(resolve, delayMs))
    try {
      engageFocus()
    } catch (err) {
      throw new Error('Failed to engage focus, make sure the element is mounted.')
    }
  }

  if (focusOnMounted) {
    onMounted(focus)
  }

  return { focus }
}

export function useFocusOnMount<T extends HTMLElement | null | undefined>(el: Ref<T>) {
  return useInputFocus(el, { focusOnMounted: true })
}