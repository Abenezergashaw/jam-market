import { defineStore } from 'pinia'

export const useCustomerOrdersStore = defineStore('customerOrders', {
  state: () => ({
    orders: [],
  }),

  actions: {
    addOrder(order) {
      this.orders.unshift({
        id: order.id,
        status: order.status,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        customerName: order.customerName,
        address: order.address,
        items: order.items,
      })
      this._persist()
    },

    hydrate() {
      if (!import.meta.client) return
      try {
        const raw = localStorage.getItem('jam_my_orders')
        if (raw) this.orders = JSON.parse(raw)
      } catch {
        this.orders = []
      }
    },

    _persist() {
      if (import.meta.client) {
        localStorage.setItem('jam_my_orders', JSON.stringify(this.orders))
      }
    },
  },
})
