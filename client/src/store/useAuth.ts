import { defineStore } from "pinia";
import axios from "axios";
import router from "../router";
import { useDialog } from "./useDialog";
import { local } from "../Locals";
import io from 'socket.io-client'
import { getUserProfileData } from "../SheetsAPI";
import { useDocumentCache } from "./useDocumentCache";
import { PanelName } from "../Panels";
import { useSheetManager } from "./useSheetManager";

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
    },
    getGoogleAccessToken() {
      const googleId = this.googleProfile?.id
      if (!googleId) {
        const { accessTokenPrefix } = local
        const tokenKey = Object.keys(localStorage).find(key => key.startsWith(accessTokenPrefix))
        if (!tokenKey) {
          console.error('useAuth getGoogleAccessToken: No google access token found')
          return
        }
        return localStorage.getItem(tokenKey)
      }
      const tokenKey = local.googleOAuthAccessToken(googleId)
      return localStorage.getItem(tokenKey)
    }
  },
  actions: {
    async createSocketConnection() {
      if (this.socket?.connected) {
        return
      }

      if (!this.getGoogleAccessToken) {
        return
      }

      this.destroySocketConnection()

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
              deleteItemCache(data.payload.sysId, data.payload.panelName)
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
        }
        this.socket.emit('connectAccount', {
          googleProfile: this.googleProfile,
          initialFocusState: {
            sysId: useSheetManager().focusedItemSysId,
            embeddedSysId: useSheetManager().focusedEmbeddedItem?.sysId,
            panelName: useSheetManager().panel.panelName,
            googleId: this.googleProfile?.id
          }
        })
      } catch {
        console.error('Unable to get user profile data')
      }
    },
    destroySocketConnection() {
      if (this.socket) {
        this.socket.disconnect()
      }
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
    async getURL(): Promise<string> {
      const response = await axios.get('/api/auth/url')
      if (!response.data.url) {
        throw new Error('No URL received')
      }
      const { url } = response.data
      return url
    },
    async userLoginFlow(googleOAuthCode: string) {

      localStorage.removeItem(local.closeAfterAuth)
      localStorage.removeItem(local.googleOAuthCode)

      try {
        let authUrl = `/api/auth/${encodeURIComponent(googleOAuthCode)}`
        // todo: add try catch here
        const { data } = await axios.get(authUrl)
        const { accessToken, profile } = data

        if (!accessToken) {
          throw new Error('No access token received')
        }

        this.setGoogleProfile(profile)
        this.setGoogleAccessToken(accessToken)

        console.log('creating socket connection...')
        await this.createSocketConnection()
      } catch (error) {
        console.error('userLoginFlow error', error)
        throw error
      }
    },
    userLogoutFlow() {
      this.removeGoogleAccessToken()
      this.forceAuthorize()
    },
    async forceAuthorize(url?: string) {
      const redirectUrl = url ?? await this.getURL();
      window.location.replace(redirectUrl)
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

      this.removeGoogleAccessToken()
      localStorage.removeItem(local.googleOAuthCode)
      localStorage.setItem(local.closeAfterAuth, 'true')

      useDialog().open({
        persistent: true,
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
        }, 500)

        setTimeout(() => {
          clearInterval(interval)
          if (!this.pendingAuthorization) {
            return
          }
          this.destroySocketConnection()
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