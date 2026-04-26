<template>
  <div class="max-w-2xl mx-auto px-4 py-8 sm:py-10">
    <h1 class="text-2xl font-bold text-zinc-900 mb-7 tracking-tight">My Orders</h1>

    <div v-if="!myOrdersStore.orders.length" class="text-center py-20">
      <div class="w-16 h-16 bg-zinc-100 border border-zinc-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p class="text-zinc-500 mb-5">No orders yet.</p>
      <NuxtLink to="/" class="btn-primary">Start shopping</NuxtLink>
    </div>

    <ul v-else class="space-y-4">
      <li v-for="order in myOrdersStore.orders" :key="order.id" class="card p-5 hover:border-zinc-300 hover:shadow-sm transition-all">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-bold text-zinc-900">Order #{{ order.id }}</span>
              <span
                class="badge"
                :class="{
                  'badge-yellow': order.status === 'PENDING',
                  'badge-green': order.status === 'CONFIRMED',
                  'badge-red': order.status === 'CANCELLED',
                }"
              >{{ order.status }}</span>
            </div>
            <p class="text-xs text-zinc-400 mt-1">{{ formatDate(order.createdAt) }}</p>
          </div>
          <span class="text-base font-bold text-zinc-900 shrink-0">${{ Number(order.totalPrice).toFixed(2) }}</span>
        </div>

        <ul class="space-y-1.5 mb-4">
          <li
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center gap-2 text-sm text-zinc-500"
          >
            <span class="font-semibold text-zinc-400">×{{ item.quantity }}</span>
            <span>{{ item.product?.name ?? 'Product' }}</span>
            <span class="text-zinc-400 text-xs ml-auto">${{ (Number(item.price) * item.quantity).toFixed(2) }}</span>
          </li>
        </ul>

        <p class="text-xs text-zinc-400 border-t border-zinc-100 pt-3 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {{ order.address }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script setup>
const myOrdersStore = useCustomerOrdersStore()

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

useHead({ title: 'My Orders — Jam Store' })
</script>
