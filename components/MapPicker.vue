<template>
  <div class="space-y-3 isolate">
    <!-- Use my location button -->
    <button
      type="button"
      class="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition-colors px-3 py-2 rounded-xl"
      :disabled="locating"
      @click="useMyLocation"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      {{ locating ? 'Getting location…' : 'Use my location' }}
    </button>

    <!-- Map container -->
    <div
      ref="mapEl"
      class="w-full rounded-2xl border border-zinc-200 overflow-hidden"
      style="height: 280px;"
    />

    <!-- Geocoded address display -->
    <div v-if="modelValue.address" class="flex items-start gap-2 text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0 mt-0.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      </svg>
      <span>{{ modelValue.address }}</span>
    </div>
    <p v-else class="text-xs text-zinc-400 italic">{{ placeholder }}</p>

    <p v-if="geoError" class="text-xs text-red-500">{{ geoError }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ lat: null, lng: null, address: '' }),
  },
  placeholder: {
    type: String,
    default: 'Drop the pin on your delivery location',
  },
})
const emit = defineEmits(['update:modelValue'])

const mapEl = ref(null)
const locating = ref(false)
const geoError = ref('')
let map = null
let marker = null

async function reverseGeocode(lat, lng) {
  try {
    const res = await $fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    )
    return res.display_name ?? ''
  } catch {
    return ''
  }
}

function updatePin(lat, lng) {
  marker.setLatLng([lat, lng])
  map.panTo([lat, lng])
}

async function onPinMove(lat, lng) {
  const address = await reverseGeocode(lat, lng)
  emit('update:modelValue', { lat, lng, address })
}

async function useMyLocation() {
  if (!navigator.geolocation) {
    geoError.value = 'Geolocation is not supported by your browser.'
    return
  }
  locating.value = true
  geoError.value = ''
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords
      updatePin(lat, lng)
      await onPinMove(lat, lng)
      locating.value = false
    },
    (err) => {
      geoError.value = 'Could not get your location. Please drag the pin manually.'
      locating.value = false
    },
    { timeout: 10000 }
  )
}

onMounted(async () => {
  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  // Fix default marker icons broken by bundlers
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  const defaultLat = props.modelValue.lat ?? -1.2921
  const defaultLng = props.modelValue.lng ?? 36.8219

  map = L.map(mapEl.value).setView([defaultLat, defaultLng], props.modelValue.lat ? 15 : 12)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)

  marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map)

  marker.on('dragend', async (e) => {
    const { lat, lng } = e.target.getLatLng()
    await onPinMove(lat, lng)
  })

  map.on('click', async (e) => {
    const { lat, lng } = e.latlng
    updatePin(lat, lng)
    await onPinMove(lat, lng)
  })

  // If we already have coords, geocode them on mount
  if (props.modelValue.lat && !props.modelValue.address) {
    await onPinMove(defaultLat, defaultLng)
  }
})

onUnmounted(() => {
  if (map) map.remove()
})
</script>
