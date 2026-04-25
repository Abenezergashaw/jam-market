<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <p class="text-sm text-zinc-500">
        {{ orders.length }} order{{ orders.length !== 1 ? 's' : '' }}
        <span v-if="refreshing" class="inline-flex items-center gap-1 text-xs text-zinc-600 ml-2">
          <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Refreshing
        </span>
      </p>
      <select v-model="statusFilter" class="input text-sm py-1.5 w-auto min-w-[140px]">
        <option value="">All statuses</option>
        <option value="PENDING">Pending</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </div>

    <div v-if="loading && !orders.length" class="space-y-3">
      <div v-for="n in 3" :key="n" class="card h-36 animate-pulse bg-zinc-800" />
    </div>

    <div v-else-if="!filteredOrders.length" class="card p-14 text-center text-zinc-500 text-sm">
      {{ statusFilter ? 'No orders with this status.' : 'No orders yet.' }}
    </div>

    <AdminOrderRow
      v-for="order in filteredOrders"
      :key="order.id"
      :order="order"
      :loading="updatingId === order.id"
      @confirm="updateStatus(order.id, 'CONFIRMED')"
      @cancel="updateStatus(order.id, 'CANCELLED')"
    />
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const { adminFetch } = useAdminFetch()

const orders = ref([])
const loading = ref(true)
const refreshing = ref(false)
const updatingId = ref(null)
const statusFilter = ref('')
let pollInterval = null

const filteredOrders = computed(() =>
  statusFilter.value
    ? orders.value.filter((o) => o.status === statusFilter.value)
    : orders.value
)

async function fetchOrders(silent = false) {
  if (!silent) loading.value = true
  else refreshing.value = true
  try {
    orders.value = await adminFetch('/api/orders')
  } catch {
    // silently fail on poll errors
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function updateStatus(id, status) {
  updatingId.value = id
  try {
    const updated = await adminFetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: { status },
    })
    const idx = orders.value.findIndex((o) => o.id === id)
    if (idx !== -1) orders.value[idx] = updated
  } catch {
    // handle error silently for now
  } finally {
    updatingId.value = null
  }
}

onMounted(() => {
  fetchOrders()
  pollInterval = setInterval(() => fetchOrders(true), 5000)
})

onUnmounted(() => clearInterval(pollInterval))

useHead({ title: 'Orders — Admin' })
</script>
