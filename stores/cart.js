import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) =>
      state.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    isEmpty: (state) => state.items.length === 0,
  },

  actions: {
    addItem(product) {
      const existing = this.items.find((i) => i.id === product.id)
      if (existing) {
        const max = existing.stock ?? Infinity
        if (existing.quantity < max) existing.quantity++
      } else {
        this.items.push({ ...product, quantity: 1 })
      }
      this._persist()
    },

    removeItem(productId) {
      this.items = this.items.filter((i) => i.id !== productId)
      this._persist()
    },

    updateQty(productId, qty) {
      if (qty < 1) {
        this.removeItem(productId)
        return
      }
      const item = this.items.find((i) => i.id === productId)
      if (item) {
        item.quantity = item.stock != null ? Math.min(qty, item.stock) : qty
        this._persist()
      }
    },

    clear() {
      this.items = []
      this._persist()
    },

    hydrate() {
      if (!import.meta.client) return
      try {
        const raw = localStorage.getItem('jam_cart')
        if (raw) this.items = JSON.parse(raw)
      } catch {
        this.items = []
      }
    },

    _persist() {
      if (import.meta.client) {
        localStorage.setItem('jam_cart', JSON.stringify(this.items))
      }
    },
  },
})
