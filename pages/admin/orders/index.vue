<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <p class="text-sm text-zinc-500">
        {{ total }} order{{ total !== 1 ? 's' : '' }}
        <span v-if="refreshing" class="inline-flex items-center gap-1 text-xs text-zinc-400 ml-2">
          <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ $t('admin.refreshing') }}
        </span>
      </p>
      <div class="flex gap-2 flex-wrap">
        <select v-model="paymentFilter" class="input text-sm py-1.5 w-auto min-w-[180px]">
          <option value="">{{ $t('admin.allPayments') }}</option>
          <option value="PENDING">{{ $t('admin.awaitingVerification') }}</option>
          <option value="COLLECTED">{{ $t('admin.verified') }}</option>
          <option value="FAILED">{{ $t('admin.paymentFailed') }}</option>
        </select>
        <select v-model="statusFilter" class="input text-sm py-1.5 w-auto min-w-[160px]">
          <option value="">{{ $t('admin.allStatuses') }}</option>
          <option value="PENDING">{{ $t('status.pending') }}</option>
          <option value="CONFIRMED">{{ $t('status.confirmed') }}</option>
          <option value="OUT_FOR_DELIVERY">{{ $t('status.outForDelivery') }}</option>
          <option value="DELIVERED">{{ $t('status.delivered') }}</option>
          <option value="CANCELLED">{{ $t('status.cancelled') }}</option>
        </select>
      </div>
    </div>

    <div v-if="loading && !orders.length" class="space-y-3">
      <div v-for="n in 3" :key="n" class="card h-36 animate-pulse bg-zinc-100" />
    </div>

    <div v-else-if="!orders.length" class="card p-14 text-center text-zinc-400 text-sm">
      {{ statusFilter ? $t('admin.noOrders') : $t('admin.noOrdersYet') }}
    </div>

    <AdminOrderRow
      v-for="order in orders"
      :key="order.id"
      :order="order"
      :loading="updatingId === order.id"
      @change-status="updateStatus"
    />

    <div v-if="totalPages > 1" class="flex items-center justify-between pt-2">
      <button
        :disabled="page === 1"
        class="text-sm font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-3 py-1.5"
        @click="changePage(page - 1)"
      >
        {{ $t('common.previous') }}
      </button>
      <span class="text-sm text-zinc-400">{{ $t('common.page', { n: page, total: totalPages }) }}</span>
      <button
        :disabled="page === totalPages"
        class="text-sm font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-3 py-1.5"
        @click="changePage(page + 1)"
      >
        {{ $t('common.next') }}
      </button>
    </div>
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
const paymentFilter = ref('')
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)
let pollInterval = null

async function fetchOrders(silent = false) {
  if (!silent) loading.value = true
  else refreshing.value = true
  try {
    const params = new URLSearchParams({ page: page.value, limit: 20 })
    if (statusFilter.value) params.set('status', statusFilter.value)
    if (paymentFilter.value) params.set('paymentStatus', paymentFilter.value)
    const result = await adminFetch(`/api/orders?${params}`)
    orders.value = result.data
    total.value = result.total
    totalPages.value = result.totalPages
  } catch {
    // silently fail on poll errors
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function changePage(p) {
  page.value = p
  fetchOrders()
}

watch([statusFilter, paymentFilter], () => {
  page.value = 1
  fetchOrders()
})

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
