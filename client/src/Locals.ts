import { PanelName } from './Panels'

export const local = {
  // stores initials set by user for signing student notes
  initials: 'initials',
  // comma separated list of pinned item sysIds for each panel
  pinned: (panelName: PanelName) => `PINNED-${panelName}`,
  // temporary google token needed for all google api calls
  googleOAuthAccessToken: 'ACCESS-TOKEN',
  // google oauth code
  googleOAuthCode: 'code',
  // time of last login flow
  timeOfLastAuth: 'lastAuth',
  // controls whether or not window.close() is called after google oauth
  closeAfterAuth: 'close-window',
  // width of the list item container on panel page
  panelListWidth: 'panelListWidth',
} as const