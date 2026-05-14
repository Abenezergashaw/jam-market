<template>
  <div class="space-y-4 max-w-6xl">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-zinc-900">Live Delivery Map</h1>
        <p class="text-xs text-zinc-400 mt-0.5">
          Updates every 30 s ·
          <span v-if="lastRefreshed">Last refreshed {{ timeAgo(lastRefreshed) }}</span>
          <span v-if="refreshing" class="inline-flex items-center gap-1 ml-2 text-zinc-400">
            <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Refreshing
          </span>
        </p>
      </div>
      <button class="btn-secondary text-sm" @click="refresh(false)">Refresh</button>
    </div>

    <!-- Map -->
    <div class="card overflow-hidden">
      <div ref="mapEl" style="height: 420px;" />
    </div>

    <!-- Delivery persons list -->
    <div class="card p-5">
      <h2 class="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Delivery Personnel</h2>

      <div v-if="loading" class="space-y-2">
        <div v-for="n in 3" :key="n" class="h-12 bg-zinc-100 rounded-xl animate-pulse" />
      </div>

      <div v-else-if="!persons.length" class="text-sm text-zinc-400 py-4 text-center">
        No delivery persons found for this store.
      </div>

      <div v-else class="divide-y divide-zinc-100">
        <div
          v-for="p in sortedPersons"
          :key="p.id"
          class="flex items-center gap-3 py-3 first:pt-0 last:pb-0 cursor-pointer hover:bg-zinc-50 rounded-lg px-2 -mx-2 transition-colors"
          @click="focusPerson(p)"
        >
          <!-- Status dot -->
          <span
            class="w-2.5 h-2.5 rounded-full shrink-0"
            :class="{
              'bg-green-500': p.freshness === 'fresh',
              'bg-amber-400': p.freshness === 'stale',
              'bg-red-400': p.freshness === 'old',
              'bg-zinc-300': p.freshness === 'none',
            }"
          />

          <!-- Name -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-zinc-800 truncate">{{ p.name || p.email }}</p>
            <p class="text-xs text-zinc-400 mt-0.5">
              <template v-if="p.locationUpdatedAt">
                Last seen {{ timeAgo(new Date(p.locationUpdatedAt)) }}
              </template>
              <template v-else>
                No location shared
              </template>
            </p>
          </div>

          <!-- Distance -->
          <div class="text-right shrink-0">
            <p v-if="p.distanceKm != null" class="text-sm font-semibold text-zinc-700">{{ p.distanceKm.toFixed(1) }} km</p>
            <p v-else class="text-xs text-zinc-300">—</p>
            <p class="text-[10px] text-zinc-400">from store</p>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap gap-4 mt-4 pt-4 border-t border-zinc-100">
        <span class="flex items-center gap-1.5 text-xs text-zinc-500"><span class="w-2 h-2 rounded-full bg-green-500 shrink-0" /> Fresh (&lt; 5 min)</span>
        <span class="flex items-center gap-1.5 text-xs text-zinc-500"><span class="w-2 h-2 rounded-full bg-amber-400 shrink-0" /> Stale (5–30 min)</span>
        <span class="flex items-center gap-1.5 text-xs text-zinc-500"><span class="w-2 h-2 rounded-full bg-red-400 shrink-0" /> Old (&gt; 30 min)</span>
        <span class="flex items-center gap-1.5 text-xs text-zinc-500"><span class="w-2 h-2 rounded-full bg-zinc-300 shrink-0" /> No location</span>
        <span class="flex items-center gap-1.5 text-xs text-zinc-500"><span class="w-3 h-3 rounded-sm bg-brand-500 shrink-0" /> Store</span>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const { adminFetch } = useAdminFetch()

const mapEl = ref(null)
const persons = ref([])
const stores = ref([])
const loading = ref(true)
const refreshing = ref(false)
const lastRefreshed = ref(null)

let map = null
let markers = []
let storeMarkers = []
let pollInterval = null
let L = null

const FRESH_MS = 5 * 60 * 1000
const STALE_MS = 30 * 60 * 1000

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getFreshness(locationUpdatedAt) {
  if (!locationUpdatedAt) return 'none'
  const age = Date.now() - new Date(locationUpdatedAt).getTime()
  if (age < FRESH_MS) return 'fresh'
  if (age < STALE_MS) return 'stale'
  return 'old'
}

function timeAgo(date) {
  const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (sec < 60) return 'just now'
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)} hr ago`
  return `${Math.floor(sec / 86400)} day${Math.floor(sec / 86400) > 1 ? 's' : ''} ago`
}

const markerColor = { fresh: '#22c55e', stale: '#f59e0b', old: '#f87171', none: '#d4d4d8' }

const storeMap = computed(() => Object.fromEntries(stores.value.map((s) => [s.id, s])))

const sortedPersons = computed(() => {
  return persons.value
    .map((p) => {
      const freshness = getFreshness(p.locationUpdatedAt)
      const hasLoc = p.lat != null && p.lng != null
      // Use the person's assigned store for distance; fall back to first available store
      const assignedStore = (p.storeId && storeMap.value[p.storeId]) || stores.value[0]
      const distanceKm = hasLoc && assignedStore?.lat && assignedStore?.lng
        ? haversineKm(Number(assignedStore.lat), Number(assignedStore.lng), Number(p.lat), Number(p.lng))
        : null
      return { ...p, freshness, distanceKm }
    })
    .sort((a, b) => {
      const order = { fresh: 0, stale: 1, old: 2, none: 3 }
      if (order[a.freshness] !== order[b.freshness]) return order[a.freshness] - order[b.freshness]
      return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
    })
})

async function fetchData(silent = false) {
  if (silent) refreshing.value = true
  try {
    const [ps, st] = await Promise.all([
      adminFetch('/api/admin/users?role=delivery'),
      adminFetch('/api/staff/my-store').catch(() => []),
    ])
    persons.value = ps
    stores.value = Array.isArray(st) ? st : (st ? [st] : [])
    lastRefreshed.value = new Date()
    updateMapMarkers()
  } catch {}
  finally {
    loading.value = false
    refreshing.value = false
  }
}

function refresh(silent = true) {
  fetchData(silent)
}

function updateMapMarkers() {
  if (!map || !L) return

  // Clear old delivery markers
  markers.forEach((m) => m.remove())
  markers = []

  // Store markers — one per store
  storeMarkers.forEach((m) => m.remove())
  storeMarkers = []
  const bounds = []
  stores.value.forEach((s) => {
    if (!s.lat || !s.lng) return
    bounds.push([Number(s.lat), Number(s.lng)])
    const m = L.circleMarker(
      [Number(s.lat), Number(s.lng)],
      { radius: 10, fillColor: '#f97316', color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.9 }
    ).addTo(map).bindPopup(`<strong>${s.name || 'Store'}</strong>`)
    storeMarkers.push(m)
  })

  sortedPersons.value.forEach((p) => {
    if (p.lat == null || p.lng == null) return
    const lat = Number(p.lat)
    const lng = Number(p.lng)
    bounds.push([lat, lng])

    const color = markerColor[p.freshness]
    const age = p.locationUpdatedAt
      ? `Last seen ${timeAgo(new Date(p.locationUpdatedAt))}`
      : 'No location'

    const marker = L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: color,
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.85,
    })
      .addTo(map)
      .bindPopup(`<strong>${p.name || p.email}</strong><br><span style="color:#71717a;font-size:12px">${age}</span>`)

    markers.push(marker)
  })

  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [40, 40] })
  } else if (bounds.length === 1) {
    map.setView(bounds[0], 14)
  }
}

function focusPerson(p) {
  if (!map || p.lat == null || p.lng == null) return
  map.setView([Number(p.lat), Number(p.lng)], 15)
  const marker = markers[sortedPersons.value.filter((x) => x.lat != null).findIndex((x) => x.id === p.id)]
  marker?.openPopup()
}

onMounted(async () => {
  await fetchData(false)

  const mod = await import('leaflet')
  L = mod.default ?? mod

  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  // Default center: first store with coordinates, else Addis Ababa
  const firstStore = stores.value.find((s) => s.lat && s.lng)
  const defaultLat = firstStore ? Number(firstStore.lat) : 9.0222
  const defaultLng = firstStore ? Number(firstStore.lng) : 38.7468

  map = L.map(mapEl.value, { zoomControl: true, scrollWheelZoom: true, tap: false }).setView([defaultLat, defaultLng], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)

  updateMapMarkers()

  pollInterval = setInterval(() => refresh(true), 30_000)
})

onUnmounted(() => {
  clearInterval(pollInterval)
  map?.remove()
})

useHead({ title: 'Live Delivery Map — Admin' })
</script>
