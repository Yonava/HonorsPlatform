import { defineStore } from "pinia";
import axios from "axios";
import router from "../router";
import { useDialog } from "./useDialog";
import { local } from "../Locals";
import io from 'socket.io-client'
import { getUserProfileData } from "../SheetsAPI";

export const useAuth = defineStore('auth', {
  state: () => ({
    pendingAuthorization: null as Promise<string> | null,
    authTimeoutInSeconds: 60,
    authTimedOut: false,
    socketInstance: null as any,
    googleProfile: null as any,
  }),
  actions: {
    async createSocketConnection() {
      if (this.socketInstance) {
        console.warn('Socket connection already exists')
        return
      }

      // if (!this.getToken()) {
      //   console.error('Socket connection cannot be created without a token')
      //   return
      // }

      const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://honors.up.railway.app/'
      console.log('Socket URL', socketUrl)
      const socket = io(socketUrl)
      this.socketInstance = socket

      await new Promise((resolve, reject) => {
        console.log('Waiting for socket connection')

        socket.on('connect', () => {
          console.log('Socket connection established')
          resolve('socket connection established')
        })

        socket.on('connect_error', (error: any) => {
          console.error('Socket connection error', error)
          reject(error)
        })
      })

      try {
        const googleProfileData = await getUserProfileData()
        this.googleProfile = googleProfileData
        socket.emit('identity', googleProfileData)
      } catch (e) {
        console.error('Unable to get user profile data')
      }
    },
    destroySocketConnection() {
    },
    getToken() {
      return localStorage.getItem(local.googleOAuthAccessToken)
    },
    setAuthTimeout(timeout: number) {
      this.authTimeoutInSeconds = timeout
    },
    setToken(token: string | null) {
      if (!token) {
        localStorage.removeItem(local.googleOAuthAccessToken)
        return
      }
      localStorage.setItem(local.googleOAuthAccessToken, token)
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
        return
      }

      const url = await this.getURL()

      // handles phones that don't support popups
      if (!window.open(url, '_blank')) {
        this.forceAuthorize(url)
        return
      }

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
            this.createSocketConnection()
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