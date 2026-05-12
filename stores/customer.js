import { defineStore } from 'pinia'

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    token: null,
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    fullName: (state) => {
      if (!state.user) return ''
      return [state.user.firstName, state.user.lastName].filter(Boolean).join(' ')
    },
  },

  actions: {
    async loginWithPhone(phone, password) {
      const res = await $fetch('/api/auth/customer/login', {
        method: 'POST',
        body: { phone, password },
      })
      this._persist(res.token, res.user)
      return res
    },

    async register(body) {
      const res = await $fetch('/api/auth/customer/register', {
        method: 'POST',
        body,
      })
      this._persist(res.token, res.user)
      return res
    },

    loginWithToken(token, user) {
      this._persist(token, user)
    },

    _persist(token, user) {
      this.token = token
      this.user = user
      if (import.meta.client) {
        localStorage.setItem('customer_token', token)
        localStorage.setItem('customer_user', JSON.stringify(user))
      }
    },

    logout() {
      this.token = null
      this.user = null
      if (import.meta.client) {
        localStorage.removeItem('customer_token')
        localStorage.removeItem('customer_user')
      }
    },

    hydrate() {
      if (!import.meta.client) return
      const token = localStorage.getItem('customer_token')
      const user = localStorage.getItem('customer_user')
      if (token && user) {
        this.token = token
        try { this.user = JSON.parse(user) } catch {}
      }
    },
  },
})
