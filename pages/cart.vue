<template>
  <div class="max-w-2xl mx-auto px-4 py-8 sm:py-12">
    <h1 class="text-2xl font-bold text-zinc-900 mb-8 tracking-tight">{{ $t('cart.title') }}</h1>

    <!-- Empty -->
    <div v-if="cartStore.isEmpty" class="text-center py-24">
      <div class="w-16 h-16 bg-zinc-100 border border-zinc-200 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 6.53A1 1 0 007.63 21h8.74a1 1 0 00.98-1.22L16 13M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
      </div>
      <p class="text-zinc-700 mb-2">{{ $t('cart.empty') }}</p>
      <p class="text-zinc-400 text-sm mb-6">{{ $t('cart.emptyHint') }}</p>
      <NuxtLink to="/" class="btn-primary">{{ $t('cart.browseProducts') }}</NuxtLink>
    </div>

    <template v-else>
      <!-- Items -->
      <ul class="space-y-2 mb-8">
        <li v-for="item in cartStore.items" :key="item.id" class="card p-3 flex items-center gap-3 hover:border-zinc-300 hover:shadow-sm transition-all">
          <ProductImage
            :src="item.imageUrl"
            :alt="item.name"
            class="w-14 h-14 object-cover rounded-xl bg-zinc-100 shrink-0"
            loading="lazy"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-zinc-900 truncate">{{ item.name }}</p>
            <p class="text-sm text-zinc-500 font-medium mt-0.5">ETB {{ Number(item.price).toFixed(2) }}</p>
          </div>

          <div class="flex flex-col items-center gap-0.5 shrink-0">
            <div class="flex items-center gap-1.5">
              <button
                class="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors text-lg leading-none"
                @click="cartStore.updateQty(item.id, item.quantity - 1)"
              >−</button>
              <span class="w-6 text-center text-sm font-semibold text-zinc-900">{{ item.quantity }}</span>
              <button
                class="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center transition-colors text-lg leading-none"
                :class="item.stock != null && item.quantity >= item.stock ? 'opacity-30 cursor-not-allowed text-zinc-400' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200'"
                :disabled="item.stock != null && item.quantity >= item.stock"
                @click="cartStore.updateQty(item.id, item.quantity + 1)"
              >+</button>
            </div>
            <span v-if="item.stock != null && item.quantity >= item.stock" class="text-[10px] text-amber-500 font-medium">{{ $t('cart.maxStock') }}</span>
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
        <div class="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 class="font-bold text-zinc-900 mb-1.5">{{ $t('cart.signInTitle') }}</h2>
        <p class="text-zinc-500 text-sm mb-5">Your cart is saved. Sign in to place your order.</p>
        <NuxtLink to="/login?redirect=/cart" class="btn-primary inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Sign in to continue
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
              <h2 class="font-bold text-zinc-900 text-sm">{{ $t('cart.deliveryDetails') }}</h2>
              <p class="text-xs text-zinc-400">{{ $t('cart.signedInAs', { name: customerStore.fullName }) }}</p>
            </div>
          </div>
          <button class="text-xs text-zinc-400 hover:text-red-500 transition-colors font-medium" @click="customerStore.logout()">
            {{ $t('nav.signOut') }}
          </button>
        </div>

        <!-- Store selector -->
        <div>
          <label class="label">{{ $t('cart.orderFrom') }}</label>

          <div v-if="storesLoading" class="text-xs text-zinc-400 italic py-2">{{ $t('cart.loadingStores') }}</div>

          <div v-else-if="stores.length === 0" class="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            {{ $t('cart.noStores') }}
          </div>

          <div v-else class="space-y-2 mt-1.5">
            <button
              v-for="store in stores"
              :key="store.id"
              type="button"
              class="w-full text-left rounded-2xl border-2 px-4 py-3 transition-all"
              :class="selectedStoreId === store.id
                ? 'border-brand-500 bg-brand-50'
                : 'border-zinc-200 bg-white hover:border-zinc-300'"
              @click="selectedStoreId = store.id"
            >
              <div class="flex items-start gap-3">
                <div
                  class="w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors"
                  :class="selectedStoreId === store.id ? 'border-brand-500' : 'border-zinc-300'"
                >
                  <div v-if="selectedStoreId === store.id" class="w-2 h-2 rounded-full bg-brand-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-zinc-900">{{ store.name }}</p>
                  <p v-if="store.address" class="text-xs text-zinc-500 mt-0.5 truncate">{{ store.address }}</p>
                  <p v-if="storeDeliveryEstimate(store)" class="text-xs text-zinc-400 mt-1">
                    {{ storeDeliveryEstimate(store) }}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label">{{ $t('cart.fullName') }}</label>
            <input v-model="form.customerName" type="text" class="input" :placeholder="$t('cart.namePlaceholder')" required />
          </div>
          <div>
            <label class="label">{{ $t('cart.phone') }}</label>
            <input v-model="form.phone" type="tel" class="input" placeholder="+251 900 000000" required />
          </div>
        </div>

        <!-- Map picker -->
        <div>
          <label class="label">
            {{ $t('cart.deliveryLocation') }}
            <span v-if="location.address" class="text-brand-500 font-normal normal-case tracking-normal text-xs ml-1">{{ $t('cart.locationSet') }}</span>
          </label>
          <MapPicker
            :model-value="location"
            @update:model-value="Object.assign(location, $event)"
          />
        </div>

        <div>
          <label class="label">{{ $t('cart.orderNotes') }} <span class="text-zinc-400 normal-case font-normal tracking-normal">{{ $t('cart.orderNotesOptional') }}</span></label>
          <input v-model="form.notes" type="text" class="input" :placeholder="$t('cart.orderNotesPlaceholder')" />
        </div>

        <!-- Payment method -->
        <div>
          <label class="label">{{ $t('cart.paymentMethod') }}</label>
          <div class="space-y-2 mt-1.5">
            <button
              type="button"
              class="w-full text-left rounded-2xl border-2 px-4 py-3 transition-all"
              :class="[
                paymentMethod === 'CASH' ? 'border-brand-500 bg-brand-50' : 'border-zinc-200 bg-white',
                !cashAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:border-zinc-300'
              ]"
              :disabled="!cashAvailable"
              @click="paymentMethod = 'CASH'"
            >
              <div class="flex items-center gap-3">
                <div class="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
                  :class="paymentMethod === 'CASH' ? 'border-brand-500' : 'border-zinc-300'">
                  <div v-if="paymentMethod === 'CASH'" class="w-2 h-2 rounded-full bg-brand-500" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-zinc-900">{{ $t('cart.cashOnDelivery') }}</p>
                  <p v-if="!cashAvailable" class="text-xs text-zinc-400 mt-0.5">{{ $t('cart.cashUnavailable') }}</p>
                </div>
              </div>
            </button>

            <button
              v-for="bank in onlineMethods"
              :key="bank.key"
              type="button"
              class="w-full text-left rounded-2xl border-2 px-4 py-3 transition-all hover:border-zinc-300"
              :class="paymentMethod === bank.key ? 'border-brand-500 bg-brand-50' : 'border-zinc-200 bg-white'"
              @click="paymentMethod = bank.key"
            >
              <div class="flex items-center gap-3">
                <div class="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
                  :class="paymentMethod === bank.key ? 'border-brand-500' : 'border-zinc-300'">
                  <div v-if="paymentMethod === bank.key" class="w-2 h-2 rounded-full bg-brand-500" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-zinc-900">{{ bank.label }}</p>
                  <p class="text-xs text-zinc-400 mt-0.5">{{ $t('cart.payBefore') }}</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Online payment instructions + verification -->
        <div v-if="selectedOnlineMethod" class="rounded-2xl bg-blue-50 border border-blue-200 p-4 space-y-4">
          <p class="text-sm font-semibold text-blue-900">{{ $t('cart.payVia', { method: selectedOnlineMethod.label }) }}</p>
          <p class="text-sm text-blue-700">{{ $t('cart.sendAmount', { amount: feeBreakdown.total.toFixed(2) }) }}</p>
          <div class="bg-white rounded-xl border border-blue-100 px-4 py-3 space-y-0.5">
            <p class="text-xs text-blue-500 font-semibold uppercase tracking-wider mb-1">{{ $t('cart.accountDetails') }}</p>
            <p class="text-base font-bold text-zinc-900 font-mono tracking-wide">
              {{ selectedOnlineAccountNumber || '—' }}
            </p>
            <p class="text-sm text-zinc-500">{{ selectedOnlineAccountName || '—' }}</p>
          </div>

          <!-- Already verified -->
          <div v-if="referenceVerified" class="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p class="text-xs font-semibold text-green-700 flex-1">{{ $t('cart.paymentVerified') }}</p>
            <button class="text-[10px] text-zinc-400 hover:text-red-500 transition-colors" @click="referenceVerified = false; referenceCode = ''">
              {{ $t('cart.change') }}
            </button>
          </div>

          <!-- Receipt already uploaded -->
          <div v-else-if="receiptUrl" class="flex items-center gap-3 bg-white rounded-xl border border-blue-100 p-3">
            <a :href="receiptUrl" target="_blank" rel="noopener">
              <img :src="receiptUrl" class="w-14 h-14 rounded-lg object-cover border border-zinc-200 shrink-0" alt="Receipt" />
            </a>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-green-700 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {{ $t('cart.receiptAttached') }}
              </p>
              <button class="text-xs text-zinc-400 hover:text-red-500 transition-colors mt-0.5" @click="receiptUrl = ''">
                {{ $t('cart.remove') }}
              </button>
            </div>
          </div>

          <!-- Verification options -->
          <template v-else>
            <!-- Option A: Reference code -->
            <div class="space-y-2">
              <p class="text-xs font-semibold text-blue-800">{{ $t('cart.enterReferenceCode') }}</p>
              <div class="flex gap-2">
                <input
                  v-model="referenceCode"
                  type="text"
                  class="input text-sm flex-1"
                  placeholder="Telebirr reference code"
                  :disabled="verifyingCode"
                  @keydown.enter.prevent="verifyReferenceCode"
                />
                <button
                  type="button"
                  class="btn-primary text-sm px-4 shrink-0"
                  :disabled="!referenceCode.trim() || verifyingCode"
                  @click="verifyReferenceCode"
                >
                  {{ verifyingCode ? '…' : $t('cart.verifyCode') }}
                </button>
              </div>
              <p v-if="verifyError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {{ verifyError }}
              </p>
            </div>

            <!-- Divider -->
            <div class="flex items-center gap-3">
              <div class="flex-1 h-px bg-blue-200" />
              <span class="text-xs text-blue-400 font-medium">or</span>
              <div class="flex-1 h-px bg-blue-200" />
            </div>

            <!-- Option B: Upload receipt -->
            <div class="space-y-1.5">
              <p class="text-xs font-semibold text-blue-800">{{ $t('cart.uploadScreenshot') }}</p>
              <input ref="receiptFileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="uploadReceipt" />
              <button
                type="button"
                class="w-full btn-secondary text-sm py-2.5 flex items-center justify-center gap-2"
                :disabled="uploadingReceipt"
                @click="receiptFileInput.click()"
              >
                <svg v-if="!uploadingReceipt" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{{ uploadingReceipt ? $t('product.uploading') : $t('cart.attachPaymentScreenshot') }}</span>
              </button>
            </div>
          </template>
        </div>

        <!-- Fee breakdown -->
        <div class="border-t border-zinc-200 pt-4 space-y-2">
          <div class="flex justify-between text-sm text-zinc-500">
            <span>{{ $t('cart.subtotal', { n: cartStore.totalItems }) }}</span>
            <span>ETB {{ feeBreakdown.subtotal.toFixed(2) }}</span>
          </div>

          <template v-if="feeBreakdown.distanceKm != null">
            <div class="flex justify-between text-sm text-zinc-500">
              <span>{{ $t('cart.delivery', { km: feeBreakdown.distanceKm.toFixed(1) }) }}</span>
              <span>ETB {{ feeBreakdown.distanceFee.toFixed(2) }}</span>
            </div>
            <div v-if="feeBreakdown.serviceCharge > 0" class="flex justify-between text-sm text-zinc-500">
              <span>{{ $t('cart.serviceCharge', { pct: feeBreakdown.serviceChargePct.toFixed(1) }) }}</span>
              <span>ETB {{ feeBreakdown.serviceCharge.toFixed(2) }}</span>
            </div>
          </template>
          <p v-else-if="location.lat && selectedStore" class="text-xs text-zinc-400 italic">{{ $t('cart.deliveryFeeOnDispatch') }}</p>

          <div v-if="feeBreakdown.discount > 0" class="flex justify-between items-center bg-brand-50 border border-brand-200 rounded-lg px-3 py-2 text-sm text-brand-700 font-semibold">
            <span class="flex items-center gap-1.5">🎁 <span>{{ feeBreakdown.promoName }}</span></span>
            <span class="text-brand-600">−ETB {{ feeBreakdown.discount.toFixed(2) }}</span>
          </div>

          <div class="flex items-center justify-between gap-4 pt-2 border-t border-zinc-100">
            <div>
              <p class="text-xs text-zinc-400">{{ $t('cart.total') }}</p>
              <p class="text-xl font-bold text-zinc-900 mt-0.5">ETB {{ feeBreakdown.total.toFixed(2) }}</p>
            </div>
            <button
              class="btn-primary shrink-0 px-6"
              :disabled="placing || !form.customerName || !form.phone || !location.address || !selectedStoreId || belowMinOrder || (selectedOnlineMethod && !receiptUrl && !referenceVerified)"
              @click="placeOrder"
            >
              {{ placing ? $t('cart.placing') : $t('cart.placeOrder') }}
            </button>
          </div>
        </div>

        <p v-if="!selectedStoreId && stores.length > 0" class="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          {{ $t('cart.selectStore') }}
        </p>
        <p v-if="!location.address" class="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          {{ $t('cart.setLocation') }}
        </p>
        <p v-if="belowMinOrder && settings" class="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          {{ $t('cart.belowMinOrder', { amount: Number(settings.minOrderAmount).toFixed(2) }) }}
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
        <h2 class="text-xl font-bold text-zinc-900 mb-1">{{ $t('cart.successTitle') }}</h2>
        <p class="text-zinc-400 text-xs mb-1">{{ $t('cart.successOrderNum', { id: placedOrder.id }) }}</p>
        <p class="text-zinc-600 text-sm mb-7">{{ $t('cart.successHint') }}</p>
        <div class="flex gap-3 justify-center">
          <NuxtLink to="/orders" class="btn-secondary">{{ $t('cart.myOrders') }}</NuxtLink>
          <NuxtLink to="/" class="btn-primary">{{ $t('cart.continueShopping') }}</NuxtLink>
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
const stores = ref([])
const storesLoading = ref(true)
const selectedStoreId = ref(null)
const paymentMethod = ref('CASH')
const receiptUrl = ref('')
const uploadingReceipt = ref(false)
const receiptFileInput = ref(null)
const referenceCode = ref('')
const referenceVerified = ref(false)
const verifyingCode = ref(false)
const verifyError = ref('')

const onlineMethods = [
  { key: 'TELEBIRR', label: 'Telebirr', acctKey: 'telebirr' },
  { key: 'CBE', label: 'CBE (Commercial Bank)', acctKey: 'cbe' },
  { key: 'BOA', label: 'BOA (Bank of Abyssinia)', acctKey: 'boa' },
]

const selectedOnlineMethod = computed(() => onlineMethods.find(m => m.key === paymentMethod.value) ?? null)

const selectedOnlineAccountNumber = computed(() => {
  const k = selectedOnlineMethod.value?.acctKey
  return k ? (settings.value?.[`${k}AccountNumber`] || '') : ''
})

const selectedOnlineAccountName = computed(() => {
  const k = selectedOnlineMethod.value?.acctKey
  return k ? (settings.value?.[`${k}AccountName`] || '') : ''
})

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

const selectedStore = computed(() => stores.value.find(s => s.id === selectedStoreId.value) ?? null)

const activePromos = ref([])

function bestPromo(subtotal, deliveryFee, distanceFee) {
  let best = null
  let bestDiscount = 0
  for (const promo of activePromos.value) {
    if (subtotal < Number(promo.minOrderAmount)) continue
    let d = 0
    if (promo.type === 'FREE_DELIVERY') {
      d = distanceFee  // only the distance-based portion, not service charge
    } else if (promo.type === 'PERCENT_OFF') {
      d = subtotal * Number(promo.value) / 100
      if (promo.maxDiscount) d = Math.min(d, Number(promo.maxDiscount))
    } else if (promo.type === 'FLAT_OFF') {
      d = Math.min(Number(promo.value), subtotal + deliveryFee)
    }
    if (d > bestDiscount) { bestDiscount = d; best = promo }
  }
  return { discount: bestDiscount, promo: best }
}

const feeBreakdown = computed(() => {
  const subtotal = cartStore.totalPrice
  const s = settings.value
  const store = selectedStore.value

  if (!store || store.lat == null || store.lng == null || location.lat == null || location.lng == null) {
    const { discount, promo } = bestPromo(subtotal, 0, 0)
    return { subtotal, distanceKm: null, distanceFee: 0, serviceCharge: 0, serviceChargePct: 0, deliveryFee: 0, discount, promoName: promo?.name ?? '', total: Math.max(0, subtotal - discount) }
  }

  const effectiveCostPerKm = store.costPerKm != null
    ? Number(store.costPerKm)
    : Number(s?.costPerKm ?? 0)
  const effectiveServiceChargePct = store.serviceChargePct != null
    ? Number(store.serviceChargePct)
    : Number(s?.serviceChargePct ?? 0)

  const distanceKm = haversineKm(Number(store.lat), Number(store.lng), location.lat, location.lng)
  const distanceFee = distanceKm * effectiveCostPerKm
  const serviceCharge = subtotal * effectiveServiceChargePct / 100
  const deliveryFee = distanceFee + serviceCharge
  const { discount, promo } = bestPromo(subtotal, deliveryFee, distanceFee)
  return { subtotal, distanceKm, distanceFee, serviceCharge, serviceChargePct: effectiveServiceChargePct, deliveryFee, discount, promoName: promo?.name ?? '', total: Math.max(0, subtotal + deliveryFee - discount) }
})

const belowMinOrder = computed(() =>
  settings.value ? feeBreakdown.value.total < Number(settings.value.minOrderAmount) : false
)

const cashAvailable = computed(() => {
  const dist = feeBreakdown.value.distanceKm
  return dist == null || dist <= 15
})

watch(cashAvailable, (ok) => {
  if (!ok && paymentMethod.value === 'CASH') paymentMethod.value = 'TELEBIRR'
})

watch(paymentMethod, () => {
  referenceCode.value = ''
  referenceVerified.value = false
  verifyError.value = ''
  receiptUrl.value = ''
})

function storeDeliveryEstimate(store) {
  if (!location.lat || !location.lng || store.lat == null || store.lng == null) return null
  const s = settings.value
  const effectiveCostPerKm = store.costPerKm != null ? Number(store.costPerKm) : Number(s?.costPerKm ?? 0)
  const distKm = haversineKm(Number(store.lat), Number(store.lng), location.lat, location.lng)
  const fee = distKm * effectiveCostPerKm
  return `~${distKm.toFixed(1)} km · ETB ${fee.toFixed(2)} delivery`
}

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
    if (saved.storeId) selectedStoreId.value = saved.storeId
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
    storeId: selectedStoreId.value,
  }))
}

onMounted(async () => {
  customerStore.hydrate()
  if (customerStore.user) {
    form.customerName = [customerStore.user.firstName, customerStore.user.lastName].filter(Boolean).join(' ')
    loadSavedPrefs()
    // Fall back to profile phone if no saved preference
    if (!form.phone && customerStore.user.phone) {
      form.phone = customerStore.user.phone
    }
  }
  const [fetchedSettings, fetchedStores, fetchedPromos] = await Promise.all([
    $fetch('/api/settings').catch(() => null),
    $fetch('/api/stores').catch(() => []),
    $fetch('/api/promotions/active').catch(() => []),
  ])
  settings.value = fetchedSettings
  stores.value = fetchedStores
  activePromos.value = fetchedPromos
  storesLoading.value = false

  if (fetchedStores.length === 1 && !selectedStoreId.value) {
    selectedStoreId.value = fetchedStores[0].id
  }
})

async function verifyReferenceCode() {
  if (!referenceCode.value.trim()) return
  verifyingCode.value = true
  verifyError.value = ''
  try {
    await $fetch('/api/payment/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerStore.token}` },
      body: { referenceCode: referenceCode.value.trim() },
    })
    referenceVerified.value = true
  } catch (e) {
    verifyError.value = e?.data?.statusMessage ?? 'Verification failed. Please upload your receipt instead.'
  } finally {
    verifyingCode.value = false
  }
}

async function uploadReceipt(event) {
  const file = event.target.files?.[0]
  if (!file) return
  uploadingReceipt.value = true
  orderError.value = ''
  try {
    const formData = new FormData()
    formData.append('image', file)
    const result = await $fetch('/api/upload/receipt', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerStore.token}` },
      body: formData,
      timeout: 15000,
    })
    receiptUrl.value = result.url
  } catch (e) {
    const isTimeout = e?.name === 'TimeoutError' || e?.cause?.name === 'TimeoutError'
    orderError.value = isTimeout
      ? 'Upload timed out. Check your connection and try again.'
      : (e?.data?.statusMessage ?? 'Failed to upload receipt. Please try again.')
  } finally {
    uploadingReceipt.value = false
    if (receiptFileInput.value) receiptFileInput.value.value = ''
  }
}

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
        storeId: selectedStoreId.value ?? null,
        paymentMethod: paymentMethod.value,
        receiptImageUrl: receiptUrl.value || undefined,
        paymentReferenceCode: referenceVerified.value ? referenceCode.value : undefined,
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
