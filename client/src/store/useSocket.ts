import { defineStore } from "pinia";
import { local } from "../Locals";
import { io } from "socket.io-client";
import { useAuth, type GoogleProfile } from "./useAuth";
import { useSheetManager } from "./useSheetManager";
import { useDocumentCache } from "./useDocumentCache";
import { PanelName } from "../Panels";
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
    panelName: PanelName,
  }
} | {
  action: 'update',
  payload: {
    item: SheetItem,
    panelName: PanelName,
  }
} | {
  action: 'prop-update',
  payload: {
    sysId: string,
    prop: string | number | symbol,
    value: any,
    panelName: PanelName,
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
  },
  actions: {
    async connect() {
      if (this.socket?.connected) {
        console.log('Socket already connected')
        return
      }

      const accessToken = localStorage.getItem(local.googleOAuthAccessToken);
      if (!accessToken) {
        console.log('No access token found')
        return
      }

      this.disconnect();

      const { userLogoutFlow, googleProfile } = useAuth()

      if (!googleProfile) {
        throw new Error('No google profile found')
      }

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
      this.socket.emit('userAction', action)
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
    checkForActionsDuringDisconnect(lastAction: LastActionData) {
      const { time, serverIsUp } = lastAction
      const { getAllDocuments } = useDocumentCache()

      if (!this.timeOfSocketDisconnect) {
        // If the socket has never disconnected, we are done here
        console.log('Socket has never disconnected')
        return
      }

      if (!serverIsUp) {
        // If the server is not up and we have disconnected, we may have missed some actions, so we need to refresh
        console.log('Server is stale, refreshing cache')
        getAllDocuments({
          showLoading: false,
          forceCacheRefresh: true
        })
        return
      }

      if (!time) {
        // If no time is returned, and the server is up, that means no actions occurred, we are done here
        console.log('No actions recorded on server, despite server being up')
        return
      }

      const actionOccurredDuringDisconnect = this.timeOfSocketDisconnect < new Date(time)

      if (!actionOccurredDuringDisconnect) {
        // If the last action occurred before the socket disconnected, we are done here
        console.log('No actions occurred during disconnect')
        return
      }

      // Uh oh, it looks like we may have missed some actions, so we need to refresh
      console.log('Missed actions, refreshing cache')
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
          action: (userAction: ActionPayload) => {
            const { action } = userAction
            switch (action) {
              case 'add':
                const { addItemCache } = useDocumentCache()
                addItemCache(userAction.payload.item, userAction.payload.panelName)
                break

              case 'delete':
                const { deleteItemCache } = useDocumentCache()
                deleteItemCache(userAction.payload.sysId, userAction.payload.panelName)
                break

              case 'update':
                const { updateItemCache } = useDocumentCache()
                updateItemCache(userAction.payload.item, userAction.payload.panelName)
                break

              case 'prop-update':
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
                getAllDocuments({
                  showLoading: false,
                  forceCacheRefresh: true
                })
                break

              case 'move':
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