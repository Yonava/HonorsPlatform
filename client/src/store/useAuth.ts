import { defineStore } from "pinia";
import axios from "axios";
import router from "../router";
import { useDialog } from "./useDialog";

export const useAuth = defineStore('auth', {
  state: () => ({
    pendingAuthorization: null as Promise<string> | null,
    authTimeoutInSeconds: 60
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
    async forceAuthorize(url?: string): Promise<string> {
      url ??= await this.getURL();
      window.location.replace(url)
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          if (this.getToken()) {
            clearInterval(interval)
            resolve('token received')
            this.pendingAuthorization = null
            useDialog().close()
          }
        }, 1000)

        setTimeout(() => {
          clearInterval(interval)
          reject('token not received')
          console.error('Token not received. Request timed out. User redirected to auth page')
          router.push({
            name: 'auth'
          })
        }, this.authTimeoutInSeconds * 1000)
      })
    },
    async authorize() {
      if (this.pendingAuthorization) {
        await this.pendingAuthorization
        return
      }

      const url = await this.getURL()

      // handles phones that don't support popups
      if (!window.open(url, '_blank')) {
        this.pendingAuthorization = this.forceAuthorize(url)
        return this.pendingAuthorization
      }

      this.setToken(null)

      useDialog().open({
        body: {
          title: 'Please Authorize',
          description: 'Please confirm authorization in the new tab that opened. Once completed, your session will automatically resume without any further action required.',
          buttons: [
            {
              text: 'Sounds good!',
              color: 'primary',
              onClick: () => {
                useDialog().close()
              }
            }
          ]
        }
      })

      this.pendingAuthorization = new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          if (this.getToken()) {
            clearInterval(interval)
            resolve('token received')
            useDialog().close()
            this.pendingAuthorization = null
          }
        }, 1000)

        setTimeout(() => {
          if (!this.pendingAuthorization) {
            return
          }
          clearInterval(interval)
          reject('token not received')
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