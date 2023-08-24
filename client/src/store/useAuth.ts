import { defineStore } from "pinia";
import axios from "axios";
import router from "../router";
import { useDialog } from "./useDialog";
import { local } from "../Locals";
import { getUserProfileData, getUserSheetPermissions } from "../SheetsAPI";
import { useSheetManager } from "./useSheetManager";
import { useSocket } from "./useSocket";

export type GoogleProfile = {
  id: string,
  name: string,
  given_name: string,
  family_name: string,
  picture: string,
  locale: string
}

export type ConnectedSocket = GoogleProfile & { socketId: string }

export type ServerErrors =
  'NO_SHEET_ACCESS' |
  'INVALID_ACCESS_TOKEN' |
  'INVALID_OAUTH_CODE' |
  'SESSION_EXPIRED' |
  'NO_ACCESS_TOKEN' |
  'REMOTE_LOGOUT' |
  'LOGOUT' |
  'SOCKET_EXCEPTION' |
  'PERMISSION_REQUEST_FAILED'

export const useAuth = defineStore('auth', {
  state: () => ({
    pendingAuthorization: null as Promise<string> | null,
    authTimeoutInSeconds: 60,
    googleProfile: null as GoogleProfile | null,
  }),
  actions: {
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
    async authorizeSession() {
      const accessToken = localStorage.getItem(local.googleOAuthAccessToken)

      if (!accessToken) {
        location.replace('/auth?error=NO_ACCESS_TOKEN')
        throw new Error('No access token found')
      }

      if (!this.googleProfile) {
        try {
          this.googleProfile = await getUserProfileData()
        } catch (e) {
          location.replace('/auth?error=SESSION_EXPIRED')
          throw new Error('Session expired')
        }
      }

      try {
        const { read, write } = await getUserSheetPermissions()
        if (!read) {
          location.replace('/auth?error=NO_SHEET_ACCESS')
          throw new Error('No sheet access')
        } else if (!write) {
          useSheetManager().setReadOnlyMode(true)
        }
      } catch (e) {
        location.replace('/auth?error=PERMISSION_REQUEST_FAILED')
        throw new Error('No sheet access')
      }
    },
    async userLoginFlow(googleOAuthCode: string) {

      localStorage.setItem(local.timeOfLastAuth, Date.now().toString())
      localStorage.removeItem(local.closeAfterAuth)
      localStorage.removeItem(local.googleOAuthCode)

      let authUrl = `/api/auth/${encodeURIComponent(googleOAuthCode)}`

      const { data } = await axios.get(authUrl) as {
        data: {
          accessToken: string,
          profile: GoogleProfile,
          error?: ServerErrors
        }
      }
      const { error } = data as { error?: ServerErrors }

      if (error) {
        location.replace(`/auth?error=${error}`)
        throw new Error(error)
      }

      this.setGoogleProfile(data.profile)
      localStorage.setItem(local.googleOAuthAccessToken, data.accessToken)

      const { connect, disconnect } = useSocket()

      disconnect()
      await connect()
    },
    userLogoutFlow({ goToAuthPage, broadcastLogoutEvent, error }: {
      goToAuthPage: boolean,
      error: ServerErrors,
      broadcastLogoutEvent: boolean,
    }) {
      localStorage.removeItem(local.googleOAuthAccessToken)

      if (broadcastLogoutEvent) {
        const { emitUserLogout } = useSocket()
        emitUserLogout()
      }

      if (goToAuthPage) {
        router.push({
          name: 'auth',
          query: {
            error
          }
        })
        return
      }
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