import { defineStore } from "pinia";
import axios from "axios";
import router from "../router";
import { useDialog } from "./useDialog";
import { local } from "../Locals";
import io from 'socket.io-client'
import { getUserProfileData } from "../SheetsAPI";
import { useDocumentCache } from "./useDocumentCache";
import { SheetItem } from "../SheetTypes";
import { PanelName } from "../Panels";

export type GoogleProfile = {
  id: string,
  name: string,
  given_name: string,
  family_name: string,
  picture: string,
  locale: string
}

export type ConnectedAccount = GoogleProfile & { socketId: string }

type ActionData = {
  action: string,
  payload: any
}

type FocusData = {
  [key in string]: {
    sysId: string | undefined,
    embeddedSysId: string | undefined,
    panelName: PanelName,
    googleId: string
  }
}

export const useAuth = defineStore('auth', {
  state: () => ({
    pendingAuthorization: null as Promise<string> | null,
    authTimeoutInSeconds: 60,
    authTimedOut: false,
    socket: null as any,
    googleProfile: null as GoogleProfile | null,
    connectedAccounts: [] as ConnectedAccount[],
    focusData: {} as FocusData
  }),
  getters: {
    getConnectedAccounts(state) {
      const excludedIds = []
      // if (state.googleProfile) {
      //   excludedIds.push(state.googleProfile.id)
      // }
      const seenIds = new Set(excludedIds);

      return state.connectedAccounts.filter(({ id }) => {
         if (seenIds.has(id)) {
          return false;
        } else {
          seenIds.add(id);
          return true;
        }
      });
    }
  },
  actions: {
    async createSocketConnection() {
      if (this.socket) {
        return
      }

      if (!this.getToken()) {
        console.error('Socket connection cannot be created without a token')
        return
      }

      const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/'
      this.socket = io(socketUrl)

      await new Promise((resolve, reject) => {
        this.socket.on('connect', () => {
          console.log('Socket connection established')
          resolve('socket connection established')
        })

        this.socket.on('connect_error', (error: any) => {
          console.error('Socket connection error', error)
          reject(error)
        })

        this.socket.on('connectedAccounts', (connectedAccounts: ConnectedAccount[]) => {
          this.connectedAccounts = connectedAccounts
        })

        this.socket.on('userAction', (data: ActionData) => {
          const { addItemCache, deleteItemCache, updateItemCache, moveItemBetweenListsCache } = useDocumentCache()
          switch (data.action) {
            case 'add':
              addItemCache(data.payload.item, data.payload.panelName)
              break

            case 'delete':
              deleteItemCache(data.payload.sysId, data.payload.panelObject)
              break

            case 'update':
              updateItemCache(data.payload.item, data.payload.panelName)
              break

            case 'prop-update':
              const { sysId, panelName, prop, value } = data.payload
              const { getItemBySysId } = useDocumentCache()
              const item = getItemBySysId(sysId, panelName)
              if (!item) {
                console.error('useAuth: (prop-update) item not found')
                return
              }
              item[prop] = value
              break

            case 'move':
              moveItemBetweenListsCache({
                oldSysId: data.payload.oldSysId,
                oldPanelName: data.payload.oldPanelName,
                newItem: data.payload.newItem,
                newPanelName: data.payload.newPanelName
              })
              break

            default:
              console.error("userAction not recognized: " + data.action)
          }
        })

        this.socket.on('userFocus', (data: FocusData) => {
          this.focusData = data
        })
      })

      try {
        const googleProfileData = await getUserProfileData()
        this.googleProfile = googleProfileData
        this.socket.emit('connectAccount', googleProfileData)
      } catch {
        console.error('Unable to get user profile data')
      }
    },
    destroySocketConnection() {
      if (!this.socket) {
        console.warn('Socket connection does not exist')
        return
      }
      this.socket.disconnect()
      this.socket = null
    },
    getToken() {
      return localStorage.getItem(local.googleOAuthAccessToken)
    },
    setAuthTimeout(timeout: number) {
      this.authTimeoutInSeconds = timeout
    },
    setToken(token: string | null) {
      if (!token) {
        localStorage.removeItem(local.googleOAuthAccessToken)
        return
      }
      localStorage.setItem(local.googleOAuthAccessToken, token)
    },
    async getURL(): Promise<string> {
      const response = await axios.get('/api/auth/url')
      if (!response.data.url) {
        throw new Error('No URL received')
      }
      const { url } = response.data
      return url
    },
    async forceAuthorize(url?: string) {
      url ??= await this.getURL();
      window.location.replace(url)
    },
    async authorize() {
      if (this.pendingAuthorization) {
        return
      }

      const url = await this.getURL()

      // handles phones that don't support popups
      if (!window.open(url, '_blank')) {
        this.forceAuthorize(url)
        return
      }

      this.destroySocketConnection()
      this.setToken(null)

      useDialog().open({
        body: {
          title: 'Please Authorize',
          description: 'Please confirm your identity before continuing. Once completed, your session will automatically resume without any further action required.',
          buttons: [
            {
              text: 'Sign In With Google',
              color: 'red',
              onClick: () => this.forceAuthorize(url)
            }
          ]
        }
      })

      this.pendingAuthorization = new Promise((resolve) => {
        const interval = setInterval(() => {
          if (this.getToken()) {
            clearInterval(interval)
            resolve('token received')
            useDialog().close()
            this.pendingAuthorization = null
            this.createSocketConnection()
          }
        }, 100)

        setTimeout(() => {
          if (!this.pendingAuthorization) {
            return
          }
          this.authTimedOut = true
          console.error('Token not received. Request timed out. User redirected to auth page')
          router.push({
            name: 'auth'
          })
        }, this.authTimeoutInSeconds * 1000)
      })

      return this.pendingAuthorization
    }
  }
})