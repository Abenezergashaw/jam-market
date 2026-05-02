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
    async loginWithOtp(otp) {
      const res = await $fetch('/api/auth/customer/otp/verify', {
        method: 'POST',
        body: { otp },
      })
      if (!res.verified) return false
      this.token = res.token
      this.user = res.user
      if (import.meta.client) {
        localStorage.setItem('customer_token', res.token)
        localStorage.setItem('customer_user', JSON.stringify(res.user))
      }
      return true
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
