import { useDialog, type DialogButton } from '@store/useDialog'

export type WarnOptions = {
  title?: string,
  description?: string,
  persistent?: boolean,
  buttons?: (resolve: (r: States) => void, reject: (r: States) => void) => DialogButton[]
}

const defaults = {
  title: 'Warning',
  description: 'You are about to perform an action that cannot be undone. Are you sure you want to continue?',
  buttons: (resolve: (r: States) => void, reject: (r: States) => void) => ([
    {
      text: 'Cancel',
      color: 'red',
      onClick: () => {
        reject('CANCELLED')
        useDialog().close()
      }
    },
    {
      text: 'Continue',
      color: 'green',
      onClick: () => {
        resolve('CONFIRMED')
        useDialog().close()
      }
    }
  ]),
  persistent: false,
} satisfies WarnOptions

type States = 'CONFIRMED' | 'CANCELLED' | 'CANCELLED_BACKGROUND'

const warn = (options: WarnOptions = {}) => new Promise<States>(async (resolve, reject) => useDialog().open({
  persistent: options.persistent ?? defaults.persistent,
  title: options.title ?? defaults.title,
  description: options.description ?? defaults.description,
  buttons: options.buttons?.(resolve, reject) ?? defaults.buttons(resolve, reject)
}).then(res => res === 'BACKGROUND_CLOSE' && reject('CANCELLED_BACKGROUND')))

export default warn