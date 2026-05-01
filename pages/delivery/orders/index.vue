<template>
  <div class="space-y-4 max-w-2xl mx-auto">
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-bold text-zinc-900">My Orders</h1>
      <span v-if="refreshing" class="inline-flex items-center gap-1 text-xs text-zinc-400">
        <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Updating
      </span>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="card h-32 animate-pulse bg-zinc-100" />
    </div>

    <div v-else-if="!orders.length" class="card p-14 text-center text-zinc-400 text-sm">
      No orders assigned to you right now.
    </div>

    <NuxtLink
      v-for="order in orders"
      :key="order.id"
      :to="`/delivery/orders/${order.id}`"
      class="card p-4 block hover:border-zinc-300 transition-all"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-bold text-zinc-900 font-mono">#{{ order.id }}</span>
            <span class="badge text-[10px]" :class="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
          </div>
          <p class="text-sm font-medium text-zinc-800 mt-1">{{ order.customerName }}</p>
          <p class="text-xs text-zinc-400 mt-0.5 truncate">{{ order.address }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">{{ order.items?.length ?? 0 }} item{{ (order.items?.length ?? 0) !== 1 ? 's' : '' }} · {{ formatDate(order.createdAt) }}</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-300 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['delivery'], layout: 'delivery', ssr: false })

const { adminFetch } = useAdminFetch()

const orders = ref([])
const loading = ref(true)
const refreshing = ref(false)
let pollInterval = null

const statusMap = {
  PENDING: { label: 'Pending', cls: 'badge-yellow' },
  CONFIRMED: { label: 'Confirmed', cls: 'badge-blue' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', cls: 'badge-orange' },
  DELIVERED: { label: 'Delivered', cls: 'badge-green' },
  CANCELLED: { label: 'Cancelled', cls: 'badge-red' },
}

function statusClass(s) { return statusMap[s]?.cls ?? '' }
function statusLabel(s) { return statusMap[s]?.label ?? s }

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function fetchOrders(silent = false) {
  if (silent) refreshing.value = true
  else loading.value = true
  try {
    orders.value = await adminFetch('/api/delivery/orders')
  } catch {}
  finally {
    loading.value = false
    refreshing.value = false
  }
}

onMounted(() => {
  fetchOrders()
  pollInterval = setInterval(() => fetchOrders(true), 8000)
})
onUnmounted(() => clearInterval(pollInterval))

useHead({ title: 'My Orders — Delivery' })
</script>
