import { defineStore } from "pinia";
import { local } from "@locals";
import { type PanelName, panels } from "@panels";
import { io } from "socket.io-client";
import { useAuth, type GoogleProfile } from "@store/useAuth";
import { useSyncState } from "@store/useSyncState";
import { useSheetManager } from "@store/useSheetManager";
import { useDocumentCache } from "@store/useDocumentCache";
import { useDialog } from "@store/useDialog";
import type { SheetItem, Announcement } from "../SheetTypes";

type ActionPayload =
{
  action: 'add',
  payload: {
    item: SheetItem
    panelName: PanelName,
  }
} | {
  action: 'delete',
  payload: {
    sysId: string,
    panelName?: PanelName,
  }
} | {
  action: 'update',
  payload: {
    item: SheetItem,
    panelName?: PanelName,
  }
} | {
  action: 'prop-update',
  payload: {
    sysId: string,
    prop: string | number | symbol,
    value: any,
    panelName?: PanelName,
  }
} | {
  action: 'refresh',
} | {
  action: 'move',
  payload: {
    item: SheetItem,
    oldPanelName: PanelName,
    newPanelName: PanelName,
  }
} | {
  action: 'announce',
  payload: Announcement
}

type ActionPayloadWithGoogleId = ActionPayload & {
  googleId: string
}

type LastActionData = {
  time: Date,
  serverIsUp: boolean,
}

type FocusData = {
  [key in string]: {
    sysId: string | undefined,
    embeddedSysId: string | undefined,
    panelName: PanelName,
    googleId: string
  }
}

export type ConnectedSocket = GoogleProfile & { socketId: string }

export const useSocket = defineStore("socket", {
  state: () => ({
    socket: null as any,
    connectedSockets: [] as ConnectedSocket[],
    focusData: {} as FocusData,
    timeOfSocketDisconnect: null as Date | null,
    accessTokenOnSocketDisconnect: null as string | null,
  }),
  getters: {
    getConnectedSockets: (state) => state.connectedSockets,
    getUniqueConnectedSockets: (state) => {
      const excludedIds: string[] = []
      if (state.socket) {
        excludedIds.push(state.socket.id)
      }
      const seenIds = new Set(excludedIds);

      return state.connectedSockets.filter(({ socketId }) => {
        if (seenIds.has(socketId)) {
          return false;
        } else {
          seenIds.add(socketId);
          return true;
        }
      });
    },
    getConnectedAccountByGoogleId: (state) => (googleId: string) => {
      return state.connectedSockets.find(socket => socket.id === googleId)
    }
  },
  actions: {
    async connect() {

      this.disconnect()

      const accessToken = localStorage.getItem(local.googleOAuthAccessToken);
      if (!accessToken) throw new Error('Access Token Must Be Set To Connect To Socket')

      const { userLogoutFlow, googleProfile } = useAuth()

      if (!googleProfile) throw new Error('Google Profile Must Be Set To Connect To Socket')

      const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/'
      this.socket = io(socketUrl);

      await new Promise((resolve, reject) => {
        this.socket.on('connect', () => {
          const accessToken = localStorage.getItem(local.googleOAuthAccessToken)
          if (this.accessTokenOnSocketDisconnect && this.accessTokenOnSocketDisconnect !== accessToken) {

            userLogoutFlow({
              goToAuthPage: true,
              error: 'INVALID_ACCESS_TOKEN',
              broadcastLogoutEvent: false,
            })
            return
          }
          resolve('SOCKET_CONNECTED')
        })

        this.socket.on('connect_error', (error: any) => {
          console.error('Socket connection error', error)
          userLogoutFlow({
            goToAuthPage: true,
            error: 'SOCKET_EXCEPTION',
            broadcastLogoutEvent: false,
          })
          reject(error)
        })
      })

      const { focusedItemSysId, focusedEmbeddedItem, getActivePanel } = useSheetManager()
      this.socket.emit('connectAccount', {
        googleProfile,
        initialFocusState: {
          sysId: focusedItemSysId,
          embeddedSysId: focusedEmbeddedItem?.sysId,
          panelName: getActivePanel.panelName,
          googleId: googleProfile?.id
        }
      }, this.checkForActionsDuringDisconnect)

      this.initiateSocketListeners()
    },
    disconnect() {
      if (this.socket) {
        this.socket.disconnect();
      }
    },
    emitUserAction(action: ActionPayload) {
      this.socket.emit('userAction', {
        ...action,
        googleId: useAuth().googleProfile?.id
      })
    },
    emitUserFocus() {
      const { googleProfile } = useAuth()
      const { focusedItemSysId, focusedEmbeddedItem, getActivePanel } = useSheetManager()

      if (!googleProfile) {
        console.error('emitUserFocus: no google profile found')
        return
      }

      this.socket.emit('userFocus', {
        googleId: googleProfile.id,
        sysId: focusedItemSysId,
        embeddedSysId: focusedEmbeddedItem?.sysId,
        panelName: getActivePanel.panelName
      })
    },
    emitUserLogout() {
      const { googleProfile } = useAuth()
      if (!googleProfile) {
        console.error('emitUserLogout: no google profile found')
        return
      }

      this.socket.emit('userLogout', googleProfile.id)
    },
    async checkForActionsDuringDisconnect(lastAction: LastActionData) {
      const { time: timeOfLastBroadcastedAction, serverIsUp } = lastAction
      const { getAllDocuments } = useDocumentCache()
      const { waitUntilSynced } = useSyncState()

      // wait for all pending writes to resolve prior to checking for missed actions
      await waitUntilSynced()

      if (!this.timeOfSocketDisconnect) {
        // If the socket has never disconnected, we are done here
        return
      }

      if (!serverIsUp) {
        // If the server is not up and we have disconnected, we may have missed some actions, so we need to refresh
        getAllDocuments({
          showLoading: false,
          forceCacheRefresh: true
        })
        return
      }

      if (!timeOfLastBroadcastedAction) {
        // If no time is returned, and the server is up, that means no actions occurred, we are done here
        return
      }

      const actionOccurredDuringDisconnect = this.timeOfSocketDisconnect < new Date(timeOfLastBroadcastedAction)

      if (!actionOccurredDuringDisconnect) {
        // If the last action occurred before the socket disconnected, we are done here
        return
      }

      // Uh oh, it looks like we may have missed some actions, so we need to refresh the cache
      getAllDocuments({
        forceCacheRefresh: true
      })
    },
    initiateSocketListeners() {
      const listeners = [
        {
          name: 'disconnect',
          action: () => {
            this.timeOfSocketDisconnect = new Date()
            this.connectedSockets = []
            this.focusData = {}
            this.accessTokenOnSocketDisconnect = localStorage.getItem(local.googleOAuthAccessToken)
            console.log('Socket connection disconnected', this.timeOfSocketDisconnect.toLocaleTimeString())
          }
        },
        {
          name: 'connectedSockets',
          action: (connectedSockets: ConnectedSocket[]) => {
            this.connectedSockets = connectedSockets
          }
        },
        {
          name: 'userLogout',
          action: (googleId: string) => {
            const { userLogoutFlow, googleProfile } = useAuth()
            if (googleId === googleProfile?.id) {
              userLogoutFlow({
                goToAuthPage: true,
                error: 'REMOTE_LOGOUT',
                broadcastLogoutEvent: false,
              })
            }
          },
        },
        {
          name: 'userAction',
          action: (userAction: ActionPayloadWithGoogleId) => {
            const {
              focusedItemSysId,
              focusedEmbeddedItem,
              getActivePanel,
              getActiveEmbeddedPanel,
              setPanel
            } = useSheetManager()
            const { openSnackbar } = useDialog()
            const { action, googleId } = userAction
            const googleProfileOfActor = this.getConnectedAccountByGoogleId(googleId)
            const actor = {
              name: googleProfileOfActor?.given_name ?? 'Someone',
              picture: googleProfileOfActor?.picture,
            }

            switch (action) {
              case 'add':
                const { addItemCache } = useDocumentCache()
                addItemCache(userAction.payload.item, userAction.payload.panelName)
                break

              case 'delete':

                if (focusedItemSysId === userAction.payload.sysId) {
                  openSnackbar({
                    text: `${actor.name} Has Deleted The ${getActivePanel.title.singular} You Were Viewing`,
                    img: actor.picture,
                    timeout: 10_000,
                  })
                } else if (focusedEmbeddedItem?.sysId === userAction.payload.sysId) {
                  openSnackbar({
                    text: `${actor.name} Has Deleted The ${getActiveEmbeddedPanel?.title.singular} You Were Viewing`,
                    img: actor.picture,
                    timeout: 10_000,
                  })
                }

                const { deleteItemCache } = useDocumentCache()
                deleteItemCache(userAction.payload.sysId, userAction.payload.panelName)
                break

              case 'update':
                const { updateItemCache } = useDocumentCache()
                updateItemCache(userAction.payload.item, userAction.payload.panelName)
                break

              case 'prop-update':

                const changeStudentSysId = userAction.payload.prop === 'studentSysId'
                const studentSysIdMovedAway = changeStudentSysId && focusedItemSysId !== userAction.payload.value
                const embeddedItemBeingUpdated = focusedEmbeddedItem?.sysId === userAction.payload.sysId
                if (embeddedItemBeingUpdated && studentSysIdMovedAway) {
                  openSnackbar({
                    text: `${actor.name} Has Changed Which ${getActivePanel.title.singular} This ${getActiveEmbeddedPanel?.title.singular} Is Associated With`,
                    img: actor.picture,
                    timeout: 10_000,
                  })
                  // Look into moving this elsewhere
                  useSheetManager().setFocusedEmbeddedItem(null)
                }

                const { getItemBySysId } = useDocumentCache()
                const item = getItemBySysId(userAction.payload.sysId, userAction.payload.panelName)
                if (!item) {
                  console.error('useAuth: (prop-update) item not found')
                  return
                }
                item[userAction.payload.prop] = userAction.payload.value
                break

              case 'refresh':
                const { getAllDocuments } = useDocumentCache()
                console.log('Refreshing cache')
                getAllDocuments({
                  showLoading: false,
                  forceCacheRefresh: true
                })
                break

              case 'move':

                const oldPanelTitle = panels[userAction.payload.oldPanelName].title.singular
                const newPanelTitle = panels[userAction.payload.newPanelName].title.plural

                if (
                  focusedItemSysId === userAction.payload.item.sysId ||
                  focusedEmbeddedItem?.sysId === userAction.payload.item.sysId
                ) {
                  openSnackbar({
                    text: `${actor.name} Has Moved This ${oldPanelTitle} To ${newPanelTitle}`,
                    img: actor.picture,
                    timeout: 10_000,
                    closable: false,
                    action: {
                      text: 'Go',
                      onClick: () => {
                        setPanel(userAction.payload.newPanelName, {
                          value: userAction.payload.item.sysId,
                        })
                      }
                    }
                  })
                }

                const { moveItemBetweenListsCache } = useDocumentCache()
                moveItemBetweenListsCache({
                  item: userAction.payload.item,
                  oldPanelName: userAction.payload.oldPanelName,
                  newPanelName: userAction.payload.newPanelName,
                })
                break

              case 'announce':
                const { addAnnouncementCache } = useDocumentCache()
                addAnnouncementCache(userAction.payload)
                break

              default:
                console.error('(userAction) action not found', action)
                break
            }
          }
        },
        {
          name: 'userFocus',
          action: (focusData: FocusData) => {
            this.focusData = focusData
          }
        }
      ]

      listeners.forEach(listener => {
        this.socket.on(listener.name, listener.action)
      })
    },
  }
});