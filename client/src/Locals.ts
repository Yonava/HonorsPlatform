import { PanelName } from '@panels'

export const local = {
  // stores initials set by user for signing student notes
  initials: 'initials',
  // comma separated list of pinned item sysIds for each panel
  pinned: (panelName: PanelName) => `pinned-${panelName}`,
  // temporary google token needed for all google api calls
  googleOAuthAccessToken: 'access-token',
  // google oauth code
  googleOAuthCode: 'code',
  // time of last login flow
  timeOfLastAuth: 'last-auth',
  // controls whether or not window.close() is called after google oauth
  closeAfterAuth: 'close-window',
  // width of the list item container on panel page
  panelListWidth: 'panel-list-width',
  // stores user generated mailing lists
  mailingLists: 'mailing-lists',
} as const

type LocalKey = keyof typeof local