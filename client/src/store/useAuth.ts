import { defineStore } from "pinia";
import axios from "axios";
import router from "../router";
import { useDialog } from "./useDialog";
import { local } from "../Locals";
import io from 'socket.io-client'
import { getUserProfileData } from "../SheetsAPI";
import { useDocumentCache } from "./useDocumentCache";
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
      const excludedIds: string[] = []
      if (state.socket) {
        excludedIds.push(state.socket.id)
      }
      const seenIds = new Set(excludedIds);

      return state.connectedAccounts.filter(({ socketId }) => {
         if (seenIds.has(socketId)) {
          return false;
        } else {
          seenIds.add(socketId);
          return true;
        }
      });
    }
  },
  actions: {
    async createSocketConnection() {
      if (this.socket?.connected) {
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

            case 'refresh':
              const { getAllDocuments } = useDocumentCache()
              getAllDocuments({
                showLoading: false,
                forceCacheRefresh: true
              })
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
        if (!this.googleProfile) {
          console.error('Google profile data not found, attempting to retrieve...')
          const googleProfileData = await getUserProfileData()
          this.googleProfile = googleProfileData
          return
        }
        this.socket.emit('connectAccount', this.googleProfile)
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
    setAuthTimeout(timeout: number) {
      this.authTimeoutInSeconds = timeout
    },
    setGoogleProfile(profile: GoogleProfile | null) {
      this.googleProfile = profile
    },
    setGoogleAccessToken(token: string) {
      const googleId = this.googleProfile?.id
      if (!googleId) {
        console.error('Google ID not found')
        return
      }
      const tokenKey = local.googleOAuthAccessToken(googleId)
      localStorage.setItem(tokenKey, token)
    },
    removeGoogleAccessToken() {
      const googleId = this.googleProfile?.id
      if (!googleId) {
        console.error('Google ID not found')
        return
      }
      const tokenKey = local.googleOAuthAccessToken(googleId)
      localStorage.removeItem(tokenKey)
    },
    async getURL(closeTabAfterAuth = false): Promise<string> {
      let requestUrl = '/api/auth/url'
      if (closeTabAfterAuth) {
        requestUrl += '?closeTabAfterAuth=true'
      }
      const response = await axios.get(requestUrl)
      console.log('getURL response', response.data)
      if (!response.data.url) {
        throw new Error('No URL received')
      }
      const { url } = response.data
      return url
    },
    async userLoginFlow(googleOAuthCode: string) {
      try {
        const { data } = await axios.get(`/api/auth/${encodeURIComponent(googleOAuthCode)}`)
        const { accessToken, profile } = data

        if (!accessToken) {
          throw new Error('No access token received')
        }

        this.setGoogleProfile(profile)
        this.setGoogleAccessToken(accessToken)

        await this.createSocketConnection()
      } catch (error) {
        console.error('userLoginFlow error', error)
        throw error
      }
    },
    async forceAuthorize() {
      const url = await this.getURL();
      window.location.replace(url)
    },
    async authorize() {
      if (this.pendingAuthorization) {
        return
      }

      const url = await this.getURL(true)

      // handles phones that don't support popups
      if (!window.open(url, '_blank')) {
        this.forceAuthorize()
        return
      }

      this.destroySocketConnection()
      this.removeGoogleAccessToken()

      useDialog().open({
        body: {
          title: 'Please Authorize',
          description: 'Please confirm your identity before continuing. Once completed, your session will automatically resume without any further action required.',
          buttons: [
            {
              text: 'Sign In With Google',
              color: 'red',
              onClick: () => this.forceAuthorize()
            }
          ]
        }
      })

      this.pendingAuthorization = new Promise((resolve) => {
        const interval = setInterval(async () => {
          const code = localStorage.getItem(local.googleOAuthCode)
          if (code) {
            clearInterval(interval)
            useDialog().close()
            await this.userLoginFlow(code)
            resolve('oauth code received')
            this.pendingAuthorization = null
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