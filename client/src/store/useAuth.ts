import { defineStore } from "pinia";
import axios from "axios";
import { local, localKeys } from "@locals";
import { useDialog } from "@store/useDialog";
import { useSheetManager } from "@store/useSheetManager";
import { useSocket } from "@store/useSocket";
import { getUser } from "@utils/users";
import type { User } from "@utils/users";
import router from "../router";

export type ServerError =
  'NO_SHEET_ACCESS' |
  'INVALID_CLIENT_TOKEN' |
  'INVALID_OAUTH_CODE' |
  'SESSION_EXPIRED' |
  'NO_CLIENT_TOKEN' |
  'LOGOUT' |
  'SOCKET_EXCEPTION' |
  'PERMISSION_REQUEST_FAILED' |
  'END_SESSION_FALLBACK' |
  'USER_DATA_FETCH_FAILED' |
  'access_denied' // Google OAuth Error defined by Google

export const getAuthErrorURL = <T extends ServerError>(error: T) => `/auth?error=${error}` as const
export const getServerAuthEndpoint = <T extends string>(route: T) => `/api/auth/${route}` as const

export const useAuth = defineStore('auth', {
  state: () => ({
    authorizationPromptOpen: false,
    user: null as User | null,
  }),
  actions: {
    async getGoogleOAuthURL() {
      const urlRoute = getServerAuthEndpoint('url')
      try {
        const { data } = await axios.get<{ url: string }>(urlRoute)
        return data.url
      } catch (e) {
        throw new Error('Could not get auth url')
      }
    },
    async authorizeSession(): Promise<ServerError | void> {
      const clientToken = local.get(localKeys.clientToken)

      if (!clientToken) {
        return 'NO_CLIENT_TOKEN'
      }

      if (!this.user) {
        try {
          this.user = await getUser()
        } catch (e) {
          return 'USER_DATA_FETCH_FAILED'
        }
      }

      if (!this.user.sheetPermissions.read) {
        return 'NO_SHEET_ACCESS'
      }

      if (!this.user.sheetPermissions.write) {
        useSheetManager().setReadOnlyMode(true)
      }
    },
    async setGoogleOAuthCode(googleOAuthCode: string) {
      local.remove(localKeys.closeAfterAuth)
      local.remove(localKeys.googleOAuthCode)

      console.log('setting google oauth code')
      try {
        const code = encodeURIComponent(googleOAuthCode)
        const oauthCodeValidationURI = `/api/auth/token/${code}`
        const { data: token } = await axios.get<string>(oauthCodeValidationURI)
        console.log('set google oauth code and received token')
        local.set(localKeys.clientToken, token)
      } catch {
        location.replace(getAuthErrorURL('INVALID_OAUTH_CODE'))
      }
    },
    logout(reason: ServerError = 'LOGOUT') {
      local.remove(localKeys.clientToken)
      location.replace(getAuthErrorURL(reason))
    },
    async endSessionAndPromptOAuth(googleAuthUrl?: string) {
      try {
        local.remove(localKeys.closeAfterAuth)
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

      local.remove(localKeys.clientToken)
      local.remove(localKeys.googleOAuthCode)
      local.set(localKeys.closeAfterAuth, 'true')

      const pollOAuthCode = setInterval(async () => {
        const code = local.get(localKeys.googleOAuthCode)
        if (code) {
          await this.setGoogleOAuthCode(code)
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