import { defineStore } from 'pinia'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    token: null,
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(email, password) {
      const data = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      this.token = data.token
      this.user = data.user
      if (import.meta.client) {
        localStorage.setItem('admin_token', data.token)
        localStorage.setItem('admin_user', JSON.stringify(data.user))
      }
    },

    logout() {
      this.token = null
      this.user = null
      if (import.meta.client) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
      }
      navigateTo('/admin/login')
    },

    hydrate() {
      if (!import.meta.client) return
      const token = localStorage.getItem('admin_token')
      if (token) this.token = token
      const user = localStorage.getItem('admin_user')
      if (user) {
        try {
          const parsed = JSON.parse(user)
          // Pull permissions from JWT if missing from stored user object
          if (!parsed.permissions && token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]))
              parsed.permissions = payload.permissions ?? []
            } catch {}
          }
          this.user = parsed
        } catch {}
      }
    },

    async refreshSession() {
      if (!this.token) return
      try {
        const data = await $fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        this.token = data.token
        this.user = data.user
        if (import.meta.client) {
          localStorage.setItem('admin_token', data.token)
          localStorage.setItem('admin_user', JSON.stringify(data.user))
        }
      } catch (e) {
        // Only log out on explicit auth failures, not network errors
        const status = e?.response?.status ?? e?.statusCode ?? e?.data?.statusCode
        if (status === 401 || status === 403) {
          this.logout()
        }
      }
    },
  },
})
