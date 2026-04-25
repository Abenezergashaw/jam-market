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
      }
    },

    logout() {
      this.token = null
      this.user = null
      if (import.meta.client) {
        localStorage.removeItem('admin_token')
      }
      navigateTo('/admin/login')
    },

    hydrate() {
      if (!import.meta.client) return
      const token = localStorage.getItem('admin_token')
      if (token) this.token = token
    },
  },
})
