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

export type ServerError =
  'NO_SHEET_ACCESS' |
  'INVALID_ACCESS_TOKEN' |
  'INVALID_OAUTH_CODE' |
  'SESSION_EXPIRED' |
  'NO_ACCESS_TOKEN' |
  'REMOTE_LOGOUT' |
  'LOGOUT' |
  'SOCKET_EXCEPTION' |
  'PERMISSION_REQUEST_FAILED' |
  'END_SESSION_FALLBACK'

const getAuthErrorURL = <T extends ServerError>(error: T) => `/auth?error=${error}` as const
const getServerAuthEndpoint = <T extends string>(route: T) => `/api/auth/${route}` as const

export const useAuth = defineStore('auth', {
  state: () => ({
    authorizationPromptOpen: false,
    googleProfile: null as GoogleProfile | null,
  }),
  actions: {
    setGoogleProfile(profile: GoogleProfile | null) {
      this.googleProfile = profile
    },
    async getGoogleOAuthURL() {
      const urlRoute = getServerAuthEndpoint('url')
      try {
        const { data } = await axios.get<{ url: string }>(urlRoute)
        return data.url
      } catch (e) {
        throw new Error('Could not get auth url')
      }
    },
    async authorizeSession() {
      const accessToken = localStorage.getItem(local.googleOAuthAccessToken)

      if (!accessToken) {
        location.replace(getAuthErrorURL('NO_ACCESS_TOKEN'))
        throw new Error('No access token found')
      }

      if (!this.googleProfile) {
        try {
          this.googleProfile = await getUserProfileData()
        } catch (e) {
          location.replace(getAuthErrorURL('SESSION_EXPIRED'))
          throw new Error('Session expired')
        }
      }

      try {
        const { read: hasReadPerms, write: hasWritePerms } = await getUserSheetPermissions()
        if (!hasReadPerms) {
          location.replace(getAuthErrorURL('NO_SHEET_ACCESS'))
          throw new Error('No sheet access')
        } else if (!hasWritePerms) {
          useSheetManager().setReadOnlyMode(true)
        }
      } catch (e) {
        location.replace(getAuthErrorURL('PERMISSION_REQUEST_FAILED'))
        throw new Error('Could not access permission status of user')
      }
    },
    async userLoginFlow(googleOAuthCode: string) {

      localStorage.removeItem(local.closeAfterAuth)
      localStorage.removeItem(local.googleOAuthCode)

      const code = encodeURIComponent(googleOAuthCode)
      const oauthCodeValidationURI = getServerAuthEndpoint(code)

      const { data } = await axios.get<{
        accessToken: string,
        profile: GoogleProfile,
        error?: ServerError
      }>(oauthCodeValidationURI)

      if (data?.error) {
        location.replace(getAuthErrorURL(data.error))
        throw new Error('Authorization Failed')
      }

      this.setGoogleProfile(data.profile)
      localStorage.setItem(local.googleOAuthAccessToken, data.accessToken)

      const { connect } = useSocket()

      try {
        await connect()
      } catch {
        console.log('Could not connect to socket')
      }
      console.log('contine')

      const timeSinceEpoch = Date.now()
      localStorage.setItem(local.timeOfLastAuth, timeSinceEpoch.toString())

      return {
        status: 'Authorized',
        at: timeSinceEpoch,
        user: data.profile
      } as const
    },
    userLogoutFlow({ goToAuthPage, broadcastLogoutEvent, error }: {
      goToAuthPage: boolean,
      error: ServerError,
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
    async endSessionAndPromptOAuth(googleAuthUrl?: string) {
      try {
        localStorage.removeItem(local.closeAfterAuth)
        const uri = googleAuthUrl ?? await this.getGoogleOAuthURL()
        location.replace(uri)
      } catch {
        const fallbackUri = getAuthErrorURL('END_SESSION_FALLBACK')
        location.replace(fallbackUri)
      }
    },
    async authorizeBeforeContinuing() {

      if (this.authorizationPromptOpen) return 'Authorization In Progress'

      this.authorizationPromptOpen = true
      const url = await this.getGoogleOAuthURL()

      const popupOpened = window.open(url, '_blank')
      if (!popupOpened) {
        this.endSessionAndPromptOAuth(url)
        throw new Error('Could not open authorization window')
      }

      localStorage.removeItem(local.googleOAuthAccessToken)
      localStorage.removeItem(local.googleOAuthCode)
      localStorage.setItem(local.closeAfterAuth, 'true')

      const pollOAuthCode = setInterval(async () => {
        const code = localStorage.getItem(local.googleOAuthCode)
        if (code) {
          await this.userLoginFlow(code)
          clearInterval(pollOAuthCode)
          useDialog().close()
        }
      }, 500)

      await useDialog().open({
        persistent: true,
        title: 'Please Authorize',
        description: 'Please confirm your identity before continuing. Once completed, your session will automatically resume without any further action required.',
        buttons: [{
          text: 'Sign In With Google',
          color: 'red',
          onClick: () => this.endSessionAndPromptOAuth()
        }]
      })

      this.authorizationPromptOpen = false
      return 'Authorized'
    }
  }
})