import { useDialog } from './store/useDialog'
import { watch } from 'vue'

type WarnOptions = {
  title?: string,
  description?: string,
  persistent?: boolean
}

export const warn = (options: WarnOptions = {}): Promise<string> => {

  const {
    title = 'Warning',
    description = 'You are about to perform an action that cannot be undone. Are you sure you want to continue?',
    persistent = false
  } = options

  const { open, close, contentTimeoutDuration, setPersistent } = useDialog()

  return new Promise((resolve, reject) => {
    let dismissWatcher = () => {}
    // wait for the dialog to open before watching for it to close
    setTimeout(() => {
      dismissWatcher = watch(() => useDialog().show, (v) => {
        if (!v) {
          reject('warn: cancelled by user — background')
          dismissWatcher()
        }
      })

      if (!persistent) {
        setPersistent(false)
      }
    }, contentTimeoutDuration + 100)
    open({
      persistent: true,
      body: {
        title,
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
              resolve('warn: confirmed by user')
              close()
            }
          }
        ]
      }
    })
  })
}