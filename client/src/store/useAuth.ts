import { defineStore } from "pinia";
import axios from "axios";
import router from "../router";
import { useDialog } from "./useDialog";

export const useAuth = defineStore('auth', {
  state: () => ({
    pendingAuthorization: null as Promise<string> | null,
    authTimeoutInSeconds: 60,
    authTimedOut: false
  }),
  actions: {
    getToken() {
      return localStorage.getItem('token')
    },
    setAuthTimeout(timeout: number) {
      this.authTimeoutInSeconds = timeout
    },
    setToken(token: string | null) {
      if (!token) {
        localStorage.removeItem('token')
        return
      }
      localStorage.setItem('token', token)
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
        await this.pendingAuthorization
        return
      }

      const url = await this.getURL()

      // handles phones that don't support popups
      if (!window.open(url, '_blank')) {
        this.forceAuthorize(url)
      }

      // give time for user to be redirected before opening dialog
      await new Promise((resolve) => setTimeout(resolve, 1000))

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
            if (this.authTimedOut) {
              router.push({
                name: 'panel'
              })
              this.authTimedOut = false
            }
          }
        }, 1000)

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