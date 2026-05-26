import { defineStore } from 'pinia'
import * as api from '../api/index.js'
import router from '../router/index.js'
import { useSearchStore } from './search.ts'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoggedIn: false,
  }),
  actions: {
    async initAuth() {
      const token = sessionStorage.getItem('sm_access_token')
      if (token) {
        this.isLoggedIn = true
        try {
          await this.fetchMe()
        } catch (error) {
          await this.logout()
        }
      } else {
        this.isLoggedIn = false
        this.user = null
        // Clear search state when no token is available
        const searchStore = useSearchStore()
        searchStore.newChat()
      }
    },

    async login(email, password) {
      try {
        const response = await api.login(email, password)
        const { access_token, refresh_token, user } = response.data

        sessionStorage.setItem('sm_access_token', access_token)
        sessionStorage.setItem('sm_refresh_token', refresh_token)

        this.isLoggedIn = true
        this.user = user || null

        // Clear search state when switching to a different account
        const searchStore = useSearchStore()
        searchStore.newChat()

        // If user object is not in login response, fetch it
        if (!this.user) {
          await this.fetchMe()
        }

        return { success: true }
      } catch (error) {
        return {
          success: false,
          status: error.response?.status,
        }
      }
    },

    async register(username, email, password) {
      try {
        await api.register(username, email, password)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          status: error.response?.status,
          data: error.response?.data,
        }
      }
    },

    async logout() {
      try {
        await api.logout()
      } catch (error) {
        // Ignore error as specified
      } finally {
        sessionStorage.removeItem('sm_access_token')
        sessionStorage.removeItem('sm_refresh_token')
        this.isLoggedIn = false
        this.user = null
        // Clear search state when logging out
        const searchStore = useSearchStore()
        searchStore.newChat()
        router.push('/login')
      }
    },

    async fetchMe() {
      try {
        const response = await api.getMe()
        this.user = response.data
      } catch (error) {
        this.user = null
        throw error
      }
    },
  },
})
