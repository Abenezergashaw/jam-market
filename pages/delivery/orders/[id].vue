<template>
  <div class="space-y-5 max-w-xl mx-auto">
    <div class="flex items-center gap-2 text-sm">
      <NuxtLink to="/delivery/orders" class="text-zinc-400 hover:text-zinc-700 transition-colors">My Orders</NuxtLink>
      <span class="text-zinc-300">/</span>
      <span class="text-zinc-700 font-semibold">#{{ route.params.id }}</span>
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="card h-28 animate-pulse bg-zinc-100" />
      <div class="card h-48 animate-pulse bg-zinc-100" />
    </div>

    <div v-else-if="!order" class="card p-10 text-center">
      <p class="text-zinc-500 mb-4">Order not found.</p>
      <NuxtLink to="/delivery/orders" class="btn-secondary text-sm">Back to orders</NuxtLink>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="card p-5">
        <div class="flex items-center gap-3 flex-wrap mb-3">
          <h1 class="text-xl font-bold text-zinc-900 font-mono">Order #{{ order.id }}</h1>
          <span class="badge" :class="statusClass">{{ statusLabel }}</span>
        </div>
        <p class="text-xs text-zinc-400">{{ formatDate(order.createdAt) }}</p>

        <div v-if="order.status === 'OUT_FOR_DELIVERY'" class="mt-4 space-y-2">
          <div class="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm font-medium">Awaiting customer confirmation</span>
          </div>
          <p class="text-xs text-zinc-400 text-center">Ask the customer to confirm receipt from their Jam Store account.</p>
        </div>
        <div v-else-if="order.status === 'DELIVERED'" class="mt-4">
          <div class="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl px-3 py-2.5 border border-green-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm font-medium">Customer confirmed receipt</span>
          </div>
        </div>
      </div>

      <!-- Customer info -->
      <div class="card p-5">
        <h2 class="text-sm font-semibold text-zinc-700 mb-4 uppercase tracking-wider">Customer</h2>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="text-sm text-zinc-800">{{ order.customerName }}</span>
          </div>
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a :href="`tel:${order.phone}`" class="text-sm text-brand-600 font-medium hover:underline">{{ order.phone }}</a>
          </div>
          <div class="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-sm text-zinc-800">{{ order.address }}</span>
          </div>
          <div v-if="order.notes" class="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span class="text-sm text-zinc-600 italic">{{ order.notes }}</span>
          </div>
        </div>
      </div>

      <!-- Items -->
      <div class="card p-5">
        <h2 class="text-sm font-semibold text-zinc-700 mb-4 uppercase tracking-wider">Items</h2>
        <ul class="space-y-3">
          <li v-for="item in order.items" :key="item.id" class="flex items-center gap-3">
            <ProductImage
              :src="item.product?.imageUrl"
              :alt="item.product?.name"
              class="w-10 h-10 rounded-xl object-cover bg-zinc-100 shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-zinc-900 truncate">{{ item.product?.name ?? 'Unknown' }}</p>
              <p class="text-xs text-zinc-400">×{{ item.quantity }}</p>
            </div>
          </li>
        </ul>
      </div>

      <!-- Map -->
      <div v-if="order.lat && order.lng" class="card p-5">
        <h2 class="text-sm font-semibold text-zinc-700 mb-3 uppercase tracking-wider">Delivery Location</h2>
        <div ref="mapEl" class="w-full rounded-xl overflow-hidden border border-zinc-200" style="height: 260px;" />
        <p class="text-xs text-zinc-400 mt-2">{{ order.lat }}, {{ order.lng }}</p>
      </div>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['delivery'], layout: 'delivery', ssr: false })

const route = useRoute()
const { adminFetch } = useAdminFetch()

const order = ref(null)
const loading = ref(true)
const mapEl = ref(null)
let map = null

const statusMap = {
  PENDING: { label: 'Pending', cls: 'badge-yellow' },
  CONFIRMED: { label: 'Confirmed', cls: 'badge-blue' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', cls: 'badge-orange' },
  DELIVERED: { label: 'Delivered', cls: 'badge-green' },
  CANCELLED: { label: 'Cancelled', cls: 'badge-red' },
}

const statusClass = computed(() => ['badge', statusMap[order.value?.status]?.cls ?? ''].join(' '))
const statusLabel = computed(() => statusMap[order.value?.status]?.label ?? order.value?.status)

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function fetchOrder() {
  try {
    order.value = await adminFetch(`/api/delivery/orders/${route.params.id}`)
  } catch { order.value = null }
  finally { loading.value = false }
}

async function initMap() {
  if (!order.value?.lat || !order.value?.lng || !mapEl.value) return

  const mod = await import('leaflet')
  const L = mod.default ?? mod

  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  const lat = parseFloat(order.value.lat)
  const lng = parseFloat(order.value.lng)
  map = L.map(mapEl.value, { zoomControl: true, scrollWheelZoom: false, tap: false }).setView([lat, lng], 16)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)
  L.marker([lat, lng]).addTo(map)
    .bindPopup(`<strong>${order.value.customerName}</strong><br>${order.value.address}`)
    .openPopup()
}

watch(mapEl, async (el) => {
  if (!el || !order.value?.lat || !order.value?.lng || map) return
  await initMap()
}, { flush: 'post' })

onMounted(fetchOrder)
onUnmounted(() => { if (map) map.remove() })

useHead({ title: `Order #${route.params.id} — Delivery` })
</script>
