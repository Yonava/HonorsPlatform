import { useDialog } from './store/useDialog'
import { watch } from 'vue'

const defaultDescription = 'You are about to perform an action that cannot be undone. Are you sure you want to continue?'

export const warn = (callback?: (...args: any[]) => Promise<void> | void, callbackArgs: any[] = [], description: string = defaultDescription): Promise<string> => {
  const { open, close } = useDialog()

  return new Promise((resolve, reject) => {
    const dismissWatcher = watch(() => useDialog().show, v => {
      if (!v) {
        reject('warn: cancelled by user — background')
        dismissWatcher()
      }
    })
    open({
      body: {
        title: 'Warning',
        description,
        buttons: [
          {
            text: 'Cancel',
            color: 'red',
            onClick: () => {
              dismissWatcher()
              reject('warn: cancelled by user')
              close()
            }
          },
          {
            text: 'Continue',
            color: 'green',
            onClick: async () => {
              dismissWatcher()
              try {
                if (callback) {
                  await callback(...callbackArgs)
                }
                resolve('warn: callback executed successfully')
              } catch {
                reject('warn: failed to execute callback')
              } finally {
                close()
              }
            }
          }
        ]
      }
    })
  })
}