<template>
  <div class="mt-4 rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-50">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-100">
      <div class="flex items-center gap-2">
        <span
          class="w-2 h-2 rounded-full shrink-0"
          :class="freshness === 'fresh' ? 'bg-green-500 animate-pulse' : freshness === 'stale' ? 'bg-amber-400' : 'bg-zinc-300'"
        />
        <span class="text-sm font-semibold text-zinc-800">
          {{ tracking?.deliveryPerson?.name ?? 'Delivery' }} is on the way
        </span>
      </div>
      <span class="text-xs text-zinc-400">
        <template v-if="tracking?.deliveryPerson?.locationUpdatedAt">
          Last seen {{ timeAgo(tracking.deliveryPerson.locationUpdatedAt) }}
        </template>
        <template v-else>No location yet</template>
      </span>
    </div>

    <!-- Map -->
    <div ref="mapEl" style="height: 220px;" />

    <!-- No location fallback -->
    <div v-if="tracking && !tracking.deliveryPerson?.lat" class="px-4 py-3 text-xs text-zinc-400 border-t border-zinc-100 bg-white">
      <template v-if="tracking.deliveryPerson?.locationUpdatedAt">
        Last known location was {{ timeAgo(tracking.deliveryPerson.locationUpdatedAt) }} — map will update when a new location is received.
      </template>
      <template v-else>
        Delivery person hasn't shared their location yet. Check back soon.
      </template>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  orderId: { type: Number, required: true },
  fetchUrl: { type: String, default: null },
  authHeader: { type: String, default: null },
})

const customerStore = useCustomerStore()
const mapEl = ref(null)
const tracking = ref(null)

let map = null
let storeMarker = null
let dpMarker = null
let customerMarker = null
let pollInterval = null
let L = null

const FRESH_MS = 5 * 60 * 1000
const STALE_MS = 30 * 60 * 1000

const freshness = computed(() => {
  const ts = tracking.value?.deliveryPerson?.locationUpdatedAt
  if (!ts) return 'none'
  const age = Date.now() - new Date(ts).getTime()
  if (age < FRESH_MS) return 'fresh'
  if (age < STALE_MS) return 'stale'
  return 'old'
})

function timeAgo(ts) {
  const sec = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (sec < 60) return 'just now'
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`
  return `${Math.floor(sec / 3600)} hr ago`
}

const markerColor = { fresh: '#22c55e', stale: '#f59e0b', old: '#f87171', none: '#a1a1aa' }

async function fetchTracking() {
  try {
    const url = props.fetchUrl ?? `/api/customer/orders/${props.orderId}/tracking`
    const token = props.authHeader ?? `Bearer ${customerStore.token}`
    const data = await $fetch(url, { headers: { Authorization: token } })
    tracking.value = data
    updateMarkers()
  } catch {}
}

function updateMarkers() {
  if (!map || !L || !tracking.value) return

  const dp = tracking.value.deliveryPerson
  const st = tracking.value.store
  const cu = { lat: tracking.value.customerLat, lng: tracking.value.customerLng, address: tracking.value.customerAddress }

  // Store marker (placed once)
  if (st?.lat && st?.lng && !storeMarker) {
    storeMarker = L.circleMarker([Number(st.lat), Number(st.lng)], {
      radius: 8, fillColor: '#f97316', color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.9,
    }).addTo(map).bindPopup(`<strong>🏪 ${st.name || 'Store'}</strong>`)
  }

  // Customer destination marker (placed once)
  if (cu?.lat && cu?.lng && !customerMarker) {
    customerMarker = L.circleMarker([Number(cu.lat), Number(cu.lng)], {
      radius: 8, fillColor: '#3b82f6', color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.9,
    }).addTo(map).bindPopup(`<strong>📍 Delivery destination</strong>${cu.address ? `<br><span style="color:#71717a;font-size:11px">${cu.address}</span>` : ''}`)
  }

  // Delivery person marker (updates position)
  if (dp?.lat && dp?.lng) {
    const color = markerColor[freshness.value]
    const latLng = [Number(dp.lat), Number(dp.lng)]
    if (dpMarker) {
      dpMarker.setLatLng(latLng).setStyle({ fillColor: color })
      dpMarker.getPopup()?.setContent(`<strong>🛵 ${dp.name}</strong><br><span style="color:#71717a;font-size:11px">Last seen ${timeAgo(dp.locationUpdatedAt)}</span>`)
    } else {
      dpMarker = L.circleMarker(latLng, {
        radius: 10, fillColor: color, color: '#fff', weight: 2.5, opacity: 1, fillOpacity: 0.9,
      }).addTo(map).bindPopup(`<strong>🛵 ${dp.name}</strong><br><span style="color:#71717a;font-size:11px">Last seen ${timeAgo(dp.locationUpdatedAt)}</span>`)
    }
  }

  // Fit all available pins
  const bounds = []
  if (dp?.lat && dp?.lng) bounds.push([Number(dp.lat), Number(dp.lng)])
  if (cu?.lat && cu?.lng) bounds.push([Number(cu.lat), Number(cu.lng)])
  if (st?.lat && st?.lng) bounds.push([Number(st.lat), Number(st.lng)])

  if (bounds.length > 1) map.fitBounds(bounds, { padding: [45, 45] })
  else if (bounds.length === 1) map.setView(bounds[0], 14)
}

onMounted(async () => {
  await fetchTracking()

  const mod = await import('leaflet')
  L = mod.default ?? mod

  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  const defaultLat = tracking.value?.store?.lat ? Number(tracking.value.store.lat) : 9.0222
  const defaultLng = tracking.value?.store?.lng ? Number(tracking.value.store.lng) : 38.7468

  map = L.map(mapEl.value, { zoomControl: false, scrollWheelZoom: false, dragging: true, tap: false })
    .setView([defaultLat, defaultLng], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)

  updateMarkers()

  pollInterval = setInterval(fetchTracking, 30_000)
})

onUnmounted(() => {
  clearInterval(pollInterval)
  map?.remove()
  map = null; storeMarker = null; dpMarker = null; customerMarker = null
})
</script>
