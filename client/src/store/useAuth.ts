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

export type ServerErrors = 'NO_SHEET_ACCESS' | 'INVALID_ACCESS_TOKEN' | 'INVALID_OAUTH_CODE'

type ActionData = {
  action: string,
  payload: any
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


export const useAuth = defineStore('auth', {
  state: () => ({
    pendingAuthorization: null as Promise<string> | null,
    authTimeoutInSeconds: 60,
    socket: null as any,
    googleProfile: null as GoogleProfile | null,
    connectedAccounts: [] as ConnectedAccount[],
    focusData: {} as FocusData,
    timeOfSocketDisconnect: null as Date | null,
    accessTokenOnDisconnect: null as string | null,
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

      const accessToken = localStorage.getItem(local.googleOAuthAccessToken)
      if (!accessToken) {
        return
      }

      this.destroySocketConnection()

      const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/'
      this.socket = io(socketUrl)

      await new Promise((resolve, reject) => {
        this.socket.on('connect', () => {
          console.log('Socket connection established, looking for latest action data...')
          const accessToken = localStorage.getItem(local.googleOAuthAccessToken)
          if (this.accessTokenOnDisconnect && this.accessTokenOnDisconnect !== accessToken) {
            console.log('Access token has changed, logging out for security reasons...')
            this.userLogoutFlow({
              goToAuthPage: true
            })
            return
          }
          resolve('socket connection established')
        })

        this.socket.on('connect_error', (error: any) => {
          console.error('Socket connection error', error)
          reject(error)
        })

        this.socket.on('disconnect', () => {
          this.timeOfSocketDisconnect = new Date()
          this.connectedAccounts = []
          this.focusData = {}
          this.accessTokenOnDisconnect = localStorage.getItem(local.googleOAuthAccessToken)
          console.log('Socket connection disconnected', this.timeOfSocketDisconnect.toLocaleTimeString())
        })

        this.socket.on('connectedAccounts', (connectedAccounts: ConnectedAccount[]) => {
          this.connectedAccounts = connectedAccounts
        })

        this.socket.on('userLogout', (googleId: string) => {
          console.log('userLogout', googleId)
          if (googleId === this.googleProfile?.id) {
            this.userLogoutFlow({
              goToAuthPage: true,
              fromLogoutEvent: true
            })
          }
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
                oldPanelName: data.payload.oldPanelName,
                newPanelName: data.payload.newPanelName,
                item: data.payload.item,
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
        }, (lastActionData: LastActionData) => {
          const { time, serverIsUp } = lastActionData
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
            // If no time is returned, and the server is up, but no actions have been recorded, we are done here
            console.log('No actions recorded on server, despite server being up')
            return
          }

          const actionOccurredDuringDisconnect = this.timeOfSocketDisconnect < new Date(time)

          if (!actionOccurredDuringDisconnect) {
            // If the last action occurred before the socket disconnected, we are done here
            console.log('No actions occurred during disconnect')
            return
          }

          // We have missed some actions, so we need to refresh
          console.log('Missed actions, refreshing cache')
          getAllDocuments({
            showLoading: false,
            forceCacheRefresh: true
          })
        })
      } catch {
        console.error('Unable to get user profile data')
      }
    },
    destroySocketConnection() {
      if (this.socket) {
        this.socket.disconnect()
      }
    },
    setAuthTimeout(timeout: number) {
      this.authTimeoutInSeconds = timeout
    },
    setGoogleProfile(profile: GoogleProfile | null) {
      this.googleProfile = profile
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

      localStorage.setItem(local.timeOfLastAuth, Date.now().toString())
      localStorage.removeItem(local.closeAfterAuth)
      localStorage.removeItem(local.googleOAuthCode)

      let authUrl = `/api/auth/${encodeURIComponent(googleOAuthCode)}`

      const { data } = await axios.get(authUrl)
      const { error } = data as { error?: ServerErrors }

      if (error) {
        location.replace(`/auth?error=${error}`)
        return
      }

      this.setGoogleProfile(data.profile)
      localStorage.setItem(local.googleOAuthAccessToken, data.accessToken)

      this.destroySocketConnection()
      await this.createSocketConnection()
    },
    userLogoutFlow({ goToAuthPage = false, fromLogoutEvent = false } = {}) {
      localStorage.removeItem(local.googleOAuthAccessToken)

      if (this.socket && !fromLogoutEvent) {
        this.socket.emit('userLogout', this.googleProfile?.id)
      }

      if (goToAuthPage) {
        router.push({
          name: 'auth'
        })
        return
      }

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

      localStorage.removeItem(local.googleOAuthAccessToken)
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