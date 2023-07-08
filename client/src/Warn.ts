import { useDialog } from './store/useDialog'
import { watch } from 'vue'

type WarnOptions = {
  title?: string,
  description?: string
}

export const warn = (options: WarnOptions = {}): Promise<string> => {

  const {
    title = 'Warning',
    description = 'You are about to perform an action that cannot be undone. Are you sure you want to continue?'
  } = options

  const { open, close } = useDialog()

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
    }, 500)
    open({
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