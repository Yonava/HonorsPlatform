import { useDialog } from './store/useDialog';

const { openSnackbar, open, close } = useDialog();
const SNACKBAR_OPEN_DUR_MS = 10_000;

export const readonlySnackbar = {
  activated: () => openSnackbar({
    text: 'You Have Been Placed In Read-Only Mode.',
    closable: false,
    action: {
      text: 'Learn More',
      onClick: () => open({
        body: {
          title: 'Read-Only Mode 📚',
          description: 'Read-Only Mode allows you to view the data on the platform without being able to edit it. Contact Honors Program staff to request access to make changes on the platform.',
          buttons: [
            {
              text: 'Dismiss',
              color: 'primary',
              onClick: close
            }
          ]
        }
      })
    },
    timeout: SNACKBAR_OPEN_DUR_MS
  }),
  deactivated: () => openSnackbar({
    text: 'You Have Been Taken Out Of Read-Only Mode.',
    timeout: SNACKBAR_OPEN_DUR_MS
  })
}