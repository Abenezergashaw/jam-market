<template>
  <div class="max-w-2xl mx-auto px-4 py-8 sm:py-12">
    <h1 class="text-2xl font-bold text-zinc-900 mb-8 tracking-tight">Your Cart</h1>

    <!-- Empty -->
    <div v-if="cartStore.isEmpty" class="text-center py-24">
      <div class="w-16 h-16 bg-zinc-100 border border-zinc-200 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 6.53A1 1 0 007.63 21h8.74a1 1 0 00.98-1.22L16 13M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
      </div>
      <p class="text-zinc-700 mb-2">Your cart is empty</p>
      <p class="text-zinc-400 text-sm mb-6">Start shopping to add items</p>
      <NuxtLink to="/" class="btn-primary">Browse products</NuxtLink>
    </div>

    <template v-else>
      <!-- Items -->
      <ul class="space-y-2 mb-8">
        <li v-for="item in cartStore.items" :key="item.id" class="card p-3 flex items-center gap-3 hover:border-zinc-300 hover:shadow-sm transition-all">
          <img
            :src="item.imageUrl"
            :alt="item.name"
            class="w-14 h-14 object-cover rounded-xl bg-zinc-100 shrink-0"
            loading="lazy"
            @error="$event.target.src = 'https://picsum.photos/56/56'"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-zinc-900 truncate">{{ item.name }}</p>
            <p class="text-sm text-zinc-500 font-medium mt-0.5">ETB {{ Number(item.price).toFixed(2) }}</p>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button
              class="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors text-lg leading-none"
              @click="cartStore.updateQty(item.id, item.quantity - 1)"
            >−</button>
            <span class="w-6 text-center text-sm font-semibold text-zinc-900">{{ item.quantity }}</span>
            <button
              class="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors text-lg leading-none"
              @click="cartStore.updateQty(item.id, item.quantity + 1)"
            >+</button>
          </div>

          <p class="text-sm font-bold text-zinc-900 w-20 text-right shrink-0">
            ETB {{ (Number(item.price) * item.quantity).toFixed(2) }}
          </p>

          <button class="text-zinc-300 hover:text-brand-500 transition-colors shrink-0" @click="cartStore.removeItem(item.id)">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </li>
      </ul>

      <!-- Login gate -->
      <div v-if="!customerStore.isAuthenticated && !placedOrder" class="card p-8 text-center">
        <div class="w-12 h-12 rounded-2xl bg-[#229ED9]/10 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#229ED9]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.31 13.9l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.838.659z"/>
          </svg>
        </div>
        <h2 class="font-bold text-zinc-900 mb-1.5">Sign in to place your order</h2>
        <p class="text-zinc-500 text-sm mb-5">Your cart is saved. Sign in with Telegram to continue — it only takes a second.</p>
        <NuxtLink to="/login?redirect=/cart" class="btn-primary inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.31 13.9l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.838.659z"/>
          </svg>
          Continue with Telegram
        </NuxtLink>
      </div>

      <!-- Checkout form (authenticated) -->
      <div v-else-if="!placedOrder" class="card p-5 sm:p-6 space-y-5">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <img
              v-if="customerStore.user?.photoUrl"
              :src="customerStore.user.photoUrl"
              :alt="customerStore.fullName"
              class="w-8 h-8 rounded-full object-cover"
            />
            <div v-else class="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-600">
              {{ customerStore.user?.firstName?.[0] ?? '?' }}
            </div>
            <div>
              <h2 class="font-bold text-zinc-900 text-sm">Delivery details</h2>
              <p class="text-xs text-zinc-400">Signed in as {{ customerStore.fullName }}</p>
            </div>
          </div>
          <button class="text-xs text-zinc-400 hover:text-red-500 transition-colors font-medium" @click="customerStore.logout()">
            Sign out
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label">Full name *</label>
            <input v-model="form.customerName" type="text" class="input" placeholder="Your name" required />
          </div>
          <div>
            <label class="label">Phone *</label>
            <input v-model="form.phone" type="tel" class="input" placeholder="+254 700 000000" required />
          </div>
        </div>

        <!-- Map picker -->
        <div>
          <label class="label">
            Delivery location *
            <span v-if="location.address" class="text-brand-500 font-normal normal-case tracking-normal text-xs ml-1">✓ location set</span>
          </label>
          <MapPicker
            :model-value="location"
            @update:model-value="Object.assign(location, $event)"
          />
        </div>

        <div>
          <label class="label">Order notes <span class="text-zinc-400 normal-case font-normal tracking-normal">(optional)</span></label>
          <input v-model="form.notes" type="text" class="input" placeholder="Leave at door, ring bell, etc." />
        </div>

        <!-- Fee breakdown -->
        <div class="border-t border-zinc-200 pt-4 space-y-2">
          <div class="flex justify-between text-sm text-zinc-500">
            <span>Subtotal ({{ cartStore.totalItems }} item{{ cartStore.totalItems !== 1 ? 's' : '' }})</span>
            <span>ETB {{ feeBreakdown.subtotal.toFixed(2) }}</span>
          </div>

          <template v-if="feeBreakdown.distanceKm != null">
            <div class="flex justify-between text-sm text-zinc-500">
              <span>Delivery ({{ feeBreakdown.distanceKm.toFixed(1) }} km)</span>
              <span>ETB {{ feeBreakdown.distanceFee.toFixed(2) }}</span>
            </div>
            <div v-if="feeBreakdown.serviceCharge > 0" class="flex justify-between text-sm text-zinc-500">
              <span>Service charge ({{ Number(settings?.serviceChargePct ?? 0).toFixed(1) }}%)</span>
              <span>ETB {{ feeBreakdown.serviceCharge.toFixed(2) }}</span>
            </div>
          </template>
          <p v-else-if="location.lat" class="text-xs text-zinc-400 italic">Delivery fee calculated on dispatch.</p>

          <div class="flex items-center justify-between gap-4 pt-2 border-t border-zinc-100">
            <div>
              <p class="text-xs text-zinc-400">Total</p>
              <p class="text-xl font-bold text-zinc-900 mt-0.5">ETB {{ feeBreakdown.total.toFixed(2) }}</p>
            </div>
            <button
              class="btn-primary shrink-0 px-6"
              :disabled="placing || !form.customerName || !form.phone || !location.address || belowMinOrder"
              @click="placeOrder"
            >
              {{ placing ? 'Placing...' : 'Place Order' }}
            </button>
          </div>
        </div>

        <p v-if="!location.address" class="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          Please drop a pin on the map or click "Use my location" to set your delivery address.
        </p>
        <p v-if="belowMinOrder && settings" class="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          Minimum order is ETB {{ Number(settings.minOrderAmount).toFixed(2) }}. Add more items to continue.
        </p>

        <p v-if="orderError" class="text-sm text-brand-700 bg-brand-50 border border-brand-200 rounded-xl px-3 py-2">{{ orderError }}</p>
      </div>

      <!-- Success -->
      <div v-else class="card p-10 text-center">
        <div class="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/25">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-zinc-900 mb-1">Order placed!</h2>
        <p class="text-zinc-400 text-xs mb-1">Order #{{ placedOrder.id }}</p>
        <p class="text-zinc-600 text-sm mb-7">We'll prepare your order and deliver it soon.</p>
        <div class="flex gap-3 justify-center">
          <NuxtLink to="/orders" class="btn-secondary">My Orders</NuxtLink>
          <NuxtLink to="/" class="btn-primary">Continue shopping</NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ ssr: false })

const cartStore = useCartStore()
const customerStore = useCustomerStore()
const myOrdersStore = useCustomerOrdersStore()

const location = reactive({ lat: null, lng: null, address: '' })

const form = reactive({
  customerName: '',
  phone: '',
  notes: '',
})

const placing = ref(false)
const orderError = ref('')
const placedOrder = ref(null)
const settings = ref(null)

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const feeBreakdown = computed(() => {
  const subtotal = cartStore.totalPrice
  const s = settings.value
  const storeLat = s?.storeLat != null ? Number(s.storeLat) : null
  const storeLng = s?.storeLng != null ? Number(s.storeLng) : null

  if (!s || location.lat == null || location.lng == null || storeLat == null || storeLng == null) {
    return { subtotal, distanceKm: null, distanceFee: 0, serviceCharge: 0, deliveryFee: 0, total: subtotal }
  }

  const distanceKm = haversineKm(storeLat, storeLng, location.lat, location.lng)
  const distanceFee = distanceKm * Number(s.costPerKm)
  const serviceCharge = subtotal * Number(s.serviceChargePct) / 100
  const deliveryFee = distanceFee + serviceCharge
  return { subtotal, distanceKm, distanceFee, serviceCharge, deliveryFee, total: subtotal + deliveryFee }
})

const belowMinOrder = computed(() =>
  settings.value ? feeBreakdown.value.total < Number(settings.value.minOrderAmount) : false
)

function savedPrefsKey() {
  return customerStore.user?.id ? `jam_prefs_${customerStore.user.id}` : null
}

function loadSavedPrefs() {
  const key = savedPrefsKey()
  if (!key) return
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (!saved) return
    if (saved.phone) form.phone = saved.phone
    if (saved.address) {
      location.lat = saved.lat ?? null
      location.lng = saved.lng ?? null
      location.address = saved.address
    }
  } catch {}
}

function savePrefs() {
  const key = savedPrefsKey()
  if (!key) return
  localStorage.setItem(key, JSON.stringify({
    phone: form.phone,
    address: location.address,
    lat: location.lat,
    lng: location.lng,
  }))
}

onMounted(async () => {
  customerStore.hydrate()
  if (customerStore.user) {
    form.customerName = [customerStore.user.firstName, customerStore.user.lastName].filter(Boolean).join(' ')
    loadSavedPrefs()
  }
  settings.value = await $fetch('/api/settings').catch(() => null)
})

async function placeOrder() {
  placing.value = true
  orderError.value = ''
  try {
    const headers = customerStore.token ? { Authorization: `Bearer ${customerStore.token}` } : {}
    const order = await $fetch('/api/orders', {
      method: 'POST',
      headers,
      body: {
        customerName: form.customerName,
        phone: form.phone,
        address: location.address,
        notes: form.notes,
        lat: location.lat,
        lng: location.lng,
        items: cartStore.items.map((i) => ({ productId: i.id, quantity: i.quantity })),
      },
    })
    savePrefs()
    myOrdersStore.addOrder(order)
    cartStore.clear()
    placedOrder.value = order
  } catch (e) {
    orderError.value = e?.data?.statusMessage ?? 'Failed to place order. Please try again.'
  } finally {
    placing.value = false
  }
}

useHead({ title: 'Cart — Jam Store' })
</script>
