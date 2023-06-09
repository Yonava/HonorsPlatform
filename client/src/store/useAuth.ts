import { defineStore } from "pinia";
import axios from "axios";
import router from "../router";
import { useDialog } from "./useDialog";

export const useAuth = defineStore('auth', {
  state: () => ({
    pendingAuthorization: null as Promise<string> | null,
    authTimeoutInSeconds: 3,
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
    async authorize(location: 'replace' | 'new_tab' = 'new_tab') {
      try {
        const response = await axios.get('/api/auth/url')
        if (!response.data.url) {
          console.error('No url returned from server')
          return
        }
        const { url } = response.data
        if (location === 'replace') {
          window.location.replace(url)
          return
        }
        if (this.pendingAuthorization) {
          console.log('awaiting pending promise')
          await this.pendingAuthorization
          return
        }
        window.open(url, '_blank')
      } catch (error) {
        console.log(error)
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
          console.log('trying to get token')
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