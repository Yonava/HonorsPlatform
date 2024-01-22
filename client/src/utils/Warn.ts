import { useDialog, type DialogButton } from '@store/useDialog'

export type Resolution = string | number
export type ResolveStates = 'CONFIRMED'
export type RejectStates = 'CANCELLED' | 'CANCELLED_BACKGROUND'

export type WarnOptions<T extends Resolution, K extends Resolution> = {
  title?: string,
  description?: string,
  persistent?: boolean,
  buttons?: (
    resolve: (r: T) => void,
    reject: (r: K) => void
  ) => DialogButton[]
}

const defaults = {
  title: 'Warning',
  description: 'You are about to perform an action that cannot be undone. Are you sure you want to continue?',
  buttons: (resolve: (r: ResolveStates) => void, reject: (r: RejectStates) => void) => ([
    {
      text: 'Cancel',
      color: 'red',
      onClick: () => reject('CANCELLED')
    },
    {
      text: 'Continue',
      color: 'green',
      onClick: () => resolve('CONFIRMED')
    }
  ]),
  persistent: false,
} as const

const warn = <
  T extends Resolution = ResolveStates,
  K extends Resolution = RejectStates,
>(options: WarnOptions<T | ResolveStates, K | RejectStates> = {}) => new Promise<T | ResolveStates>(
  async (resolve, reject) => useDialog().open({
    persistent: options.persistent ?? defaults.persistent,
    title: options.title ?? defaults.title,
    description: options.description ?? defaults.description,
    buttons: options.buttons?.(resolve, reject) ?? defaults.buttons(resolve, reject),
  })
  .then(res => {
    res === 'BACKGROUND_CLOSE' && reject('CANCELLED_BACKGROUND')
  }))
  .finally(() => useDialog().close())

export default warn