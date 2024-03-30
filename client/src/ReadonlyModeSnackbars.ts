import { useDialog } from '@store/useDialog';

export const readonlySnackbar = () => {
  const { openSnackbar, open, close } = useDialog();
  const SNACKBAR_OPEN_DUR_MS = 10_000;

  return {
    activated: () => openSnackbar({
      text: 'You Have Been Placed In Read-Only Mode.',
      closable: false,
      action: {
        text: 'Learn More',
        onClick: () => open({
          title: 'Read-Only Mode 📚',
          description: 'You may view platform data without editing. Contact Honors Program staff to request editing access.',
          buttons: [
            {
              text: 'ok',
              color: 'primary',
              onClick: close
            }
          ]
        })
      },
      timeout: SNACKBAR_OPEN_DUR_MS
    }),
    deactivated: () => openSnackbar({
      text: 'You Have Been Placed Off Read-Only Mode.',
      timeout: SNACKBAR_OPEN_DUR_MS
    })
  }
}