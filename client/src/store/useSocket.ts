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
    prop: string,
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

export const useDialog = defineStore("socket", {
  state: () => ({
    socket: null as any,
    connectedSockets: [] as ConnectedSocket[],
    focusData: {} as FocusData,
    timeOfSocketDisconnect: null as Date | null,
    accessTokenOnSocketDisconnect: null as string | null,
  }),
  getters: {
    getConnectedSockets: (state) => state.connectedSockets,
  },
  actions: {
    async connect() {
      if (this.socket?.connected) {
        throw new Error('Socket already connected')
      }

      const accessToken = localStorage.getItem(local.googleOAuthAccessToken);
      if (!accessToken) {
        throw new Error('No access token found')
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
              goToAuthPage: true
            })
            return
          }
          resolve('SOCKET_CONNECTED')
        })

        this.socket.on('connect_error', (error: any) => {
          console.error('Socket connection error', error)
          userLogoutFlow({
            goToAuthPage: true
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
    },
    disconnect() {
      if (this.socket) {
        this.socket.disconnect();
      }
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
          },
          callback: () => {
            console.log('Connected sockets updated')
          }
        },
        {
          name: 'userLogout',
          action: (googleId: string) => {
            const { userLogoutFlow, googleProfile } = useAuth()
            if (googleId === googleProfile?.id) {
              userLogoutFlow({
                goToAuthPage: true,
                fromLogoutEvent: true
              })
            }
          },
        },
        {
          name: 'userAction',
          action: ({ action, payload }: ActionPayload) => {
            if (action === 'remove') {
              console.log('Announcement received', payload.message)
              return
            }
          },
        }
      ]

      const defaultCallback = () => {
        console.log('Socket event received')
      }

      listeners.forEach(listener => {
        this.socket.on(listener.name, listener.action, listener?.callback ?? defaultCallback)
      })
    },
  }
});