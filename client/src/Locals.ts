import type { PanelName } from '@panels'

export const localKeys = {
  // stores initials set by user for signing student notes
  initials: 'initials',
  // comma separated list of pinned item sysIds for each panel
  pinned: (panelName: PanelName) => `pinned-${panelName}` as const,
  // temporary google token needed for all google api calls
  clientToken: 'client-token',
  // google oauth code
  googleOAuthCode: 'code',
  // controls whether or not window.close() is called after google oauth
  closeAfterAuth: 'close-window',
  // width of the list item container on panel page
  panelListWidth: 'panel-list-width',
  // stores user generated mailing lists
  mailingLists: 'mailing-lists',
  // stores notes in the meeting note editor before they are saved
  unsavedNote: (sysId: string) => `unsaved-note-${sysId}` as const,
} as const

type LocalTypes = {
  'close-window': 'true' | 'false',
}

type LocalObj = typeof localKeys

type Returnify<T> = T extends (...args: any[]) => infer U ? U : T
type LocalKeys = Returnify<LocalObj[keyof LocalObj]>

type LocalType<T extends LocalKeys> = T extends keyof LocalTypes ? LocalTypes[T] : string

export const local = {
  get: <T extends LocalKeys>(key: T) => localStorage.getItem(key),
  set: <T extends LocalKeys, K extends LocalType<T>>(key: T, value: K) => localStorage.setItem(key, value),
  remove: <T extends LocalKeys>(key: T) => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
}
