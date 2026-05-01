import { defineStore } from 'pinia'

export const useCustomerOrdersStore = defineStore('customerOrders', {
  state: () => ({
    orders: [],
    loading: false,
  }),

  actions: {
    addOrder(order) {
      // Optimistic insert so order appears immediately after checkout
      if (!this.orders.find((o) => o.id === order.id)) {
        this.orders.unshift({
          id: order.id,
          status: order.status,
          totalPrice: order.totalPrice,
          createdAt: order.createdAt,
          customerName: order.customerName,
          address: order.address,
          items: order.items,
          paymentMethod: order.paymentMethod ?? 'CASH',
          paymentStatus: order.paymentStatus ?? 'PENDING',
        })
      }
      this._persist()
    },

    async hydrate() {
      if (!import.meta.client) return
      const customerStore = useCustomerStore()
      if (customerStore.isAuthenticated) {
        await this.fetchFromServer()
      } else {
        try {
          const raw = localStorage.getItem('jam_my_orders')
          if (raw) this.orders = JSON.parse(raw)
        } catch {
          this.orders = []
        }
      }
    },

    async fetchFromServer() {
      const customerStore = useCustomerStore()
      if (!customerStore.isAuthenticated) return
      this.loading = true
      try {
        const orders = await $fetch('/api/customer/orders', {
          headers: { Authorization: `Bearer ${customerStore.token}` },
        })
        this.orders = orders
        this._persist()
      } catch {
        // fall back to localStorage cache on network failure
        if (!this.orders.length) {
          try {
            const raw = localStorage.getItem('jam_my_orders')
            if (raw) this.orders = JSON.parse(raw)
          } catch {}
        }
      } finally {
        this.loading = false
      }
    },

    _persist() {
      if (import.meta.client) {
        localStorage.setItem('jam_my_orders', JSON.stringify(this.orders))
      }
    },
  },
})
