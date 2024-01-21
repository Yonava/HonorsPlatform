import { useDialog, CONTENT_TIMEOUT_DURATION_MS } from '@store/useDialog'
import { watch } from 'vue'

type WarnOptions = {
  title?: string,
  description?: string,
  persistent?: boolean
}

type States = 'CONFIRMED' | 'CANCELLED' | 'CANCELLED_BACKGROUND'

export const warn = (options: WarnOptions = {}): Promise<States> => {

  const {
    title = 'Warning',
    description = 'You are about to perform an action that cannot be undone. Are you sure you want to continue?',
  } = options

  const { open, close } = useDialog()

  return new Promise((resolve, reject) => {
    let dismissWatcher = () => { }

    // wait for the dialog to open before watching for it to close
    setTimeout(() => {
      dismissWatcher = watch(() => useDialog().show, (v) => {
        if (!v) {
          reject('CANCELLED_BACKGROUND')
          dismissWatcher()
        }
      })
    }, CONTENT_TIMEOUT_DURATION_MS + 100)

    open({
      persistent: true,
      title,
      description,
      buttons: [
        {
          text: 'Cancel',
          color: 'red',
          onClick: () => {
            dismissWatcher()
            reject('CANCELLED')
            close()
          }
        },
        {
          text: 'Continue',
          color: 'green',
          onClick: async () => {
            dismissWatcher()
            resolve('CONFIRMED')
            close()
          }
        }
      ]
    })
  })
}