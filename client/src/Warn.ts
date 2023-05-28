import { useDialog } from './store/useDialog'

const defaultDescription = 'You are about to perform an action that cannot be undone. Are you sure you want to continue?'

export const warn = (callback?: () => Promise<void> | void, description: string = defaultDescription): Promise<string> => {
  const { open, close } = useDialog()
  return new Promise((resolve, reject) => {
    open({
      body: {
        title: 'Warning',
        description,
        buttons: [
          {
            text: 'Cancel',
            color: 'red',
            onClick: () => {
              reject('warn: cancelled by user')
              close()
            }
          },
          {
            text: 'Continue',
            color: 'green',
            onClick: async () => {
              try {
                if (callback) {
                  await callback()
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