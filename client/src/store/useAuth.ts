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

const getAuthErrorURL = <T extends ServerError>(error: T) => `/auth?error=${error}` as const
const getServerAuthEndpoint = <T extends string>(route: T) => `/api/auth/${route}` as const

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
    async authorizeSession() {
      const clientToken = local.get(localKeys.clientToken)

      if (!clientToken) {
        location.replace(getAuthErrorURL('NO_CLIENT_TOKEN'))
        throw 'No client token found'
      }

      if (!this.user) {
        try {
          this.user = await getUser()
        } catch (e) {
          location.replace(getAuthErrorURL('USER_DATA_FETCH_FAILED'))
          throw 'Could not get user profile data'
        }
      }

      if (!this.user.sheetPermissions.read) {
        location.replace(getAuthErrorURL('NO_SHEET_ACCESS'))
        throw 'No sheet access'
      }

      if (!this.user.sheetPermissions.write) {
        useSheetManager().setReadOnlyMode(true)
      }
    },
    async userLoginFlow(googleOAuthCode: string) {

      local.remove(localKeys.closeAfterAuth)
      local.remove(localKeys.googleOAuthCode)

      try {
        const code = encodeURIComponent(googleOAuthCode)
        const oauthCodeValidationURI = `/api/auth/token/${code}`
        const { data: token } = await axios.get<string>(oauthCodeValidationURI)
        local.set(localKeys.clientToken, token)
      } catch {
        location.replace(getAuthErrorURL('INVALID_OAUTH_CODE'))
      }

      try {
        this.user = await getUser()
      } catch {
        location.replace(getAuthErrorURL('USER_DATA_FETCH_FAILED'))
      }

      try {
        const { connect } = useSocket()
        await connect()
      } catch {
        location.replace(getAuthErrorURL('SOCKET_EXCEPTION'))
      }
    },
    userLogoutFlow({ goToAuthPage, error }: {
      goToAuthPage: boolean,
      error: ServerError
    }) {

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