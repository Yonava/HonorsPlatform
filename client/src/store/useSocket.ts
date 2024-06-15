import { defineStore } from "pinia";
import { local, localKeys } from "@locals";
import { type PanelName, panels } from "@panels";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { useAuth } from "@store/useAuth";
import type { UserGoogleProfile } from "@utils/users";
import { useSyncState } from "@store/useSyncState";
import { useSheetManager } from "@store/useSheetManager";
import { useDocumentCache } from "@store/useDocumentCache";
import { useDialog } from "@store/useDialog";
import type { SheetItem } from "@apptypes/sheetItems";
import type { Announcement } from "@apptypes/misc";

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

type FocusData = Record<string, {
  sysId: string | undefined,
  embeddedSysId: string | undefined,
  panelName: PanelName,
  googleId: string
}>

export type ConnectedSocket = UserGoogleProfile & { socketId: string }

type SocketStore = {
  socket: Socket | null,
  connectedSockets: ConnectedSocket[],
  focusData: FocusData,
  timeOfSocketDisconnect: Date | null,
}

export const useSocket = defineStore("socket", {
  state: () => ({
    socket: null,
    connectedSockets: [],
    focusData: {},
    timeOfSocketDisconnect: null,
  } as SocketStore),
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

      // needed for when cached data development version is active
      // return

      this.disconnect()

      const { user } = useAuth()

      if (!user) throw 'User Must Be Logged In To Connect To Socket'

      const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/'
      this.socket = io(socketUrl);

      this.socket.on('connect_error', (e) => {
        // TODO check token status
        console.error(`Socket Connection Error: ${e}`)
      })

      const { focusedItemSysId, focusedEmbeddedItem, getActivePanel } = useSheetManager()

      this.socket.emit('connectAccount', {
        googleProfile: user.googleProfile,
        initialFocusState: {
          sysId: focusedItemSysId,
          embeddedSysId: focusedEmbeddedItem?.sysId,
          panelName: getActivePanel.panelName,
          googleId: user.googleProfile.id
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
      if (!this.socket) {
        console.error('emitUserAction: no socket found')
        return
      }
      const { user } = useAuth()
      if (!user) {
        console.error('emitUserAction: no user found')
        return
      }
      this.socket.emit('userAction', {
        ...action,
        googleId: user.googleProfile.id
      })
    },
    emitUserFocus() {
      const { user } = useAuth()
      const { focusedItemSysId, focusedEmbeddedItem, getActivePanel } = useSheetManager()

      if (!user) {
        console.error('emitUserFocus: no google profile found')
        return
      }

      if (!this.socket) {
        console.error('emitUserFocus: no socket found')
        return
      }

      this.socket.emit('userFocus', {
        googleId: user.googleProfile.id,
        sysId: focusedItemSysId,
        embeddedSysId: focusedEmbeddedItem?.sysId,
        panelName: getActivePanel.panelName
      })
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
          }
        },
        {
          name: 'connectedSockets',
          action: (connectedSockets: ConnectedSocket[]) => {
            this.connectedSockets = connectedSockets
          }
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

                // @ts-expect-error
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