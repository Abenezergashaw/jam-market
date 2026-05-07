<template>
  <div class="space-y-4 max-w-2xl mx-auto">
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-bold text-zinc-900">{{ $t('delivery.myOrders') }}</h1>
      <span v-if="refreshing" class="inline-flex items-center gap-1 text-xs text-zinc-400">
        <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ $t('delivery.updating') }}
      </span>
    </div>

    <!-- Location sharing toggle -->
    <div class="card p-4 flex items-center justify-between gap-3">
      <div>
        <p class="text-sm font-semibold text-zinc-800">{{ $t('delivery.shareLocation') }}</p>
        <p v-if="lastSharedAt" class="text-xs text-green-600 mt-0.5">{{ $t('delivery.lastShared', { time: timeAgo(lastSharedAt) }) }}</p>
        <p v-else-if="!locationSharing" class="text-xs text-zinc-400 mt-0.5">{{ $t('delivery.locationHint') }}</p>
        <p v-if="locationError" class="text-xs text-red-500 mt-1">
          {{ locationError }} —
          <button class="underline" @click="() => { locationError = ''; sendLocation() }">try again</button>
          or refresh the page
        </p>
      </div>
      <button
        type="button"
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0"
        :class="locationSharing ? 'bg-green-500' : 'bg-zinc-300'"
        @click="toggleLocationSharing"
      >
        <span
          class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform"
          :class="locationSharing ? 'translate-x-6' : 'translate-x-1'"
        />
      </button>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="card h-32 animate-pulse bg-zinc-100" />
    </div>

    <div v-else-if="!orders.length" class="card p-14 text-center text-zinc-400 text-sm">
      {{ $t('delivery.noOrders') }}
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
          <p class="text-xs text-zinc-400 mt-0.5">{{ $t('common.items', { n: order.items?.length ?? 0 }) }} · {{ formatDate(order.createdAt) }}</p>
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
const { t } = useLocale()

const orders = ref([])
const loading = ref(true)
const refreshing = ref(false)
let pollInterval = null

const statusMap = computed(() => ({
  PENDING: { label: t('status.pending'), cls: 'badge-yellow' },
  CONFIRMED: { label: t('status.confirmed'), cls: 'badge-blue' },
  OUT_FOR_DELIVERY: { label: t('status.outForDelivery'), cls: 'badge-orange' },
  DELIVERED: { label: t('status.delivered'), cls: 'badge-green' },
  CANCELLED: { label: t('status.cancelled'), cls: 'badge-red' },
}))

function statusClass(s) { return statusMap.value[s]?.cls ?? '' }
function statusLabel(s) { return statusMap.value[s]?.label ?? s }

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

const locationSharing = ref(false)
const locationError = ref('')
const lastSharedAt = ref(null)
let locationInterval = null

function timeAgo(date) {
  const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (sec < 60) return 'just now'
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`
  return `${Math.floor(sec / 3600)} hr ago`
}

async function sendLocation() {
  try {
    const pos = await new Promise((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 })
    )
    await adminFetch('/api/delivery/location', {
      method: 'PATCH',
      body: { lat: pos.coords.latitude, lng: pos.coords.longitude },
    })
    locationError.value = ''
    lastSharedAt.value = new Date()
  } catch {
    locationError.value = 'Could not get location'
  }
}

function startLocationSharing() {
  if (!navigator.geolocation) {
    locationError.value = 'Geolocation not supported'
    locationSharing.value = false
    return
  }
  sendLocation()
  locationInterval = setInterval(sendLocation, 30_000)
}

function stopLocationSharing() {
  clearInterval(locationInterval)
  locationInterval = null
}

function toggleLocationSharing() {
  locationSharing.value = !locationSharing.value
  localStorage.setItem('deliveryLocationSharing', locationSharing.value ? '1' : '0')
  if (locationSharing.value) startLocationSharing()
  else stopLocationSharing()
}

onMounted(() => {
  fetchOrders()
  pollInterval = setInterval(() => fetchOrders(true), 8000)
  if (localStorage.getItem('deliveryLocationSharing') === '1') {
    locationSharing.value = true
    startLocationSharing()
  }
})
onUnmounted(() => {
  clearInterval(pollInterval)
  stopLocationSharing()
})

useHead({ title: 'My Orders — Delivery' })
</script>
