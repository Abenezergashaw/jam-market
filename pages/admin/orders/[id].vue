<template>
  <div class="space-y-6 max-w-5xl">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm">
      <NuxtLink to="/admin/orders" class="text-zinc-400 hover:text-zinc-700 transition-colors">Orders</NuxtLink>
      <span class="text-zinc-300">/</span>
      <span class="text-zinc-700 font-semibold">#{{ route.params.id }}</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div class="card h-40 animate-pulse bg-zinc-100" />
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="card h-64 animate-pulse bg-zinc-100" />
        <div class="card h-64 animate-pulse bg-zinc-100" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="!order" class="card p-10 text-center">
      <p class="text-zinc-500 mb-4">Order not found.</p>
      <NuxtLink to="/admin/orders" class="btn-secondary text-sm">Back to orders</NuxtLink>
    </div>

    <template v-else>
      <!-- Header card -->
      <div class="card p-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div class="flex items-center gap-3 flex-wrap">
            <h1 class="text-xl font-bold text-zinc-900 font-mono">Order #{{ order.id }}</h1>
            <span :class="statusClass">{{ statusLabel }}</span>
          </div>
          <p class="text-xs text-zinc-400 mt-1">{{ formatDate(order.createdAt) }}</p>
        </div>

        <!-- Status action buttons — driven by TRANSITIONS map -->
        <div class="flex items-center gap-2 flex-wrap">
          <button
            v-for="t in availableTransitions"
            :key="t.to"
            :class="[t.style === 'primary' ? 'btn-primary' : t.style === 'danger' ? 'btn-danger' : 'btn-secondary', 'text-sm px-4']"
            :disabled="updating"
            @click="handleTransitionClick(t.to)"
          >
            {{ updating && pendingStatus === t.to ? '…' : t.label }}
          </button>
        </div>
      </div>

      <!-- Dispatch: assign delivery person -->
      <div v-if="showDispatchModal" class="card p-5 border-brand-200 bg-brand-50/50 space-y-3">
        <h3 class="text-sm font-semibold text-zinc-800">Assign Delivery Person (optional)</h3>
        <select v-model="selectedDeliveryPerson" class="input text-sm">
          <option :value="null">— No assignment —</option>
          <option v-for="dp in deliveryPersons" :key="dp.id" :value="dp.id">{{ dp.name || dp.email }}</option>
        </select>
        <div class="flex gap-2">
          <button class="btn-primary text-sm px-4" :disabled="updating" @click="confirmDispatch">
            {{ updating ? '…' : 'Confirm Dispatch' }}
          </button>
          <button class="btn-secondary text-sm px-4" @click="showDispatchModal = false">Cancel</button>
        </div>
      </div>

      <!-- Error banner -->
      <p v-if="updateError" class="text-sm text-brand-700 bg-brand-50 border border-brand-200 rounded-xl px-4 py-2.5">{{ updateError }}</p>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Left: Order items + total -->
        <div class="space-y-4">
          <div class="card p-5">
            <h2 class="text-sm font-semibold text-zinc-700 mb-4 uppercase tracking-wider">Order Items</h2>
            <ul class="space-y-3">
              <li
                v-for="item in order.items"
                :key="item.id"
                class="flex items-center gap-3"
              >
                <img
                  :src="item.product?.imageUrl"
                  :alt="item.product?.name"
                  class="w-10 h-10 rounded-xl object-cover bg-zinc-100 shrink-0"
                  @error="$event.target.src = 'https://picsum.photos/40/40'"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-zinc-900 truncate">{{ item.product?.name ?? 'Unknown' }}</p>
                  <p class="text-xs text-zinc-400">×{{ item.quantity }} · ETB {{ Number(item.price).toFixed(2) }} each</p>
                </div>
                <span class="text-sm font-semibold text-zinc-700 shrink-0">ETB {{ (Number(item.price) * item.quantity).toFixed(2) }}</span>
              </li>
            </ul>
            <div class="border-t border-zinc-100 mt-4 pt-4 flex items-center justify-between">
              <span class="text-sm text-zinc-500">Total</span>
              <span class="text-lg font-bold text-zinc-900">ETB {{ Number(order.totalPrice).toFixed(2) }}</span>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="order.notes" class="card p-4">
            <h2 class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Order Notes</h2>
            <p class="text-sm text-zinc-700 italic">{{ order.notes }}</p>
          </div>

          <!-- Payment -->
          <div class="card p-5 space-y-4">
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <h2 class="text-sm font-semibold text-zinc-700 uppercase tracking-wider">Payment</h2>
              <div class="flex items-center gap-2">
                <span
                  class="badge text-xs"
                  :class="order.paymentMethod === 'CASH' || order.paymentMethod === 'COD' ? 'badge-green' : 'badge-blue'"
                >
                  {{ PM_LABEL[order.paymentMethod] ?? order.paymentMethod }}
                </span>
                <span
                  class="badge text-xs"
                  :class="order.paymentStatus === 'COLLECTED' ? 'badge-green' : order.paymentStatus === 'FAILED' ? 'badge-red' : 'badge-yellow'"
                >
                  {{ order.paymentStatus === 'COLLECTED' ? 'Collected' : order.paymentStatus === 'FAILED' ? 'Failed' : 'Pending' }}
                </span>
              </div>
            </div>

            <!-- Audit trail -->
            <div v-if="order.paymentVerifiedAt" class="text-xs text-zinc-400 bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>
                {{ order.paymentStatus === 'COLLECTED' ? 'Collected' : 'Failed' }} by
                <span class="font-medium text-zinc-600">{{ order.paymentVerifiedBy?.name || order.paymentVerifiedBy?.email || 'Admin' }}</span>
                · {{ formatDate(order.paymentVerifiedAt) }}
              </span>
            </div>

            <!-- Receipt -->
            <div v-if="order.receiptImageUrl">
              <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Payment Receipt</p>
              <a :href="order.receiptImageUrl" target="_blank" rel="noopener" class="block w-full">
                <img
                  :src="order.receiptImageUrl"
                  alt="Payment receipt"
                  class="w-full max-h-56 object-contain rounded-xl border border-zinc-200 bg-zinc-50 hover:opacity-90 transition-opacity cursor-zoom-in"
                />
              </a>
              <p class="text-[10px] text-zinc-400 mt-1.5 text-center">Click to open full size</p>
            </div>
            <p v-else class="text-xs text-zinc-400 bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2.5">
              No receipt uploaded.
            </p>

            <!-- Reference code display -->
            <div v-if="order.paymentReferenceCode" class="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p class="text-[10px] text-green-600 font-semibold uppercase tracking-wider">Verified via reference code</p>
                <p class="text-xs font-mono text-zinc-700 mt-0.5">{{ order.paymentReferenceCode }}</p>
              </div>
            </div>

            <!-- Payment status actions -->
            <div v-if="order.paymentStatus === 'PENDING'" class="space-y-2 pt-1">
              <div>
                <label class="label text-xs">Note <span class="text-zinc-400 font-normal normal-case tracking-normal">(optional — amount mismatch, dispute, etc.)</span></label>
                <input
                  v-model="paymentNoteInput"
                  type="text"
                  maxlength="300"
                  class="input text-sm"
                  placeholder="e.g. Amount sent was ETB 450, expected 500"
                  :disabled="!!updatingPayment"
                />
              </div>
              <div class="flex gap-2">
                <button
                  class="btn-primary text-sm px-4 flex-1"
                  :disabled="!!updatingPayment"
                  @click="updatePaymentStatus('COLLECTED')"
                >
                  {{ updatingPayment === 'COLLECTED' ? '…' : 'Mark Collected' }}
                </button>
                <button
                  class="btn-danger text-sm px-4 flex-1"
                  :disabled="!!updatingPayment"
                  @click="updatePaymentStatus('FAILED')"
                >
                  {{ updatingPayment === 'FAILED' ? '…' : 'Mark Failed' }}
                </button>
              </div>
            </div>

            <!-- Payment note (after action) -->
            <div v-if="order.paymentNote" class="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2.5">
              <span class="font-semibold">Note: </span>{{ order.paymentNote }}
            </div>
            <p v-else-if="order.paymentStatus === 'COLLECTED'" class="text-xs text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              Payment confirmed as collected.
            </p>
            <p v-else-if="order.paymentStatus === 'FAILED'" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              Payment marked as failed.
            </p>
          </div>
        </div>

        <!-- Right: Customer + Delivery map -->
        <div class="space-y-4">
          <!-- Customer card -->
          <div class="card p-5">
            <h2 class="text-sm font-semibold text-zinc-700 mb-4 uppercase tracking-wider">Customer & Delivery</h2>

            <div v-if="order.customer" class="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-100">
              <img
                v-if="order.customer.photoUrl"
                :src="order.customer.photoUrl"
                class="w-10 h-10 rounded-full object-cover shrink-0"
              />
              <div v-else class="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-600 shrink-0">
                {{ order.customer.firstName?.[0] ?? '?' }}
              </div>
              <div>
                <p class="text-sm font-semibold text-zinc-900">{{ order.customer.firstName }} {{ order.customer.lastName ?? '' }}</p>
                <p v-if="order.customer.username" class="text-xs text-zinc-400">@{{ order.customer.username }}</p>
              </div>
            </div>

            <div class="space-y-2 text-sm">
              <div class="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="text-zinc-700">{{ order.customerName }}</span>
              </div>
              <div class="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span class="text-zinc-700">{{ order.phone }}</span>
              </div>
              <div class="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="text-zinc-700">{{ order.address }}</span>
              </div>
            </div>

            <!-- Assigned delivery person -->
            <div v-if="order.deliveryPerson" class="mt-4 pt-4 border-t border-zinc-100 flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 shrink-0">
                {{ (order.deliveryPerson.name || order.deliveryPerson.email)?.[0]?.toUpperCase() }}
              </div>
              <div>
                <p class="text-xs text-zinc-400">Assigned delivery</p>
                <p class="text-sm font-medium text-zinc-800">{{ order.deliveryPerson.name || order.deliveryPerson.email }}</p>
              </div>
              <span class="ml-auto badge badge-orange text-[10px]">Delivery</span>
            </div>
            <div v-else-if="['CONFIRMED', 'OUT_FOR_DELIVERY'].includes(order.status)" class="mt-4 pt-4 border-t border-zinc-100">
              <p class="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">No delivery person assigned</p>
            </div>
          </div>

          <!-- Delivery map -->
          <div class="card p-5">
            <h2 class="text-sm font-semibold text-zinc-700 mb-3 uppercase tracking-wider">Delivery Location</h2>
            <div v-if="order.lat && order.lng">
              <div ref="mapEl" class="w-full rounded-xl overflow-hidden border border-zinc-200" style="height: 280px;" />
              <p class="text-xs text-zinc-400 mt-2 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {{ order.lat }}, {{ order.lng }}
              </p>
            </div>
            <div v-else class="text-center py-8 text-zinc-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p class="text-sm">No GPS coordinates for this order</p>
              <p class="text-xs mt-1">Address: {{ order.address }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const route = useRoute()
const { adminFetch } = useAdminFetch()

const order = ref(null)
const loading = ref(true)
const updating = ref(false)
const pendingStatus = ref(null)
const updateError = ref('')
const updatingPayment = ref(null)
const paymentNoteInput = ref('')
const mapEl = ref(null)
const showDispatchModal = ref(false)
const selectedDeliveryPerson = ref(null)
const deliveryPersons = ref([])
let map = null

const PM_LABEL = { CASH: 'Cash', COD: 'Cash', TELEBIRR: 'Telebirr', CBE: 'CBE', BOA: 'BOA' }

const statusMap = {
  PENDING: { label: 'Pending', cls: 'badge-yellow' },
  CONFIRMED: { label: 'Confirmed', cls: 'badge-blue' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', cls: 'badge-orange' },
  DELIVERED: { label: 'Delivered', cls: 'badge-green' },
  CANCELLED: { label: 'Cancelled', cls: 'badge-red' },
}

const TRANSITIONS = {
  PENDING: [
    { to: 'CONFIRMED', label: 'Confirm Order', style: 'primary' },
    { to: 'CANCELLED', label: 'Cancel Order', style: 'danger' },
  ],
  CONFIRMED: [
    { to: 'OUT_FOR_DELIVERY', label: 'Mark Out for Delivery', style: 'primary' },
    { to: 'PENDING', label: 'Revert to Pending', style: 'secondary' },
    { to: 'CANCELLED', label: 'Cancel Order', style: 'danger' },
  ],
  OUT_FOR_DELIVERY: [
    { to: 'DELIVERED', label: 'Mark Delivered', style: 'primary' },
    { to: 'CONFIRMED', label: 'Return to Store', style: 'secondary' },
    { to: 'CANCELLED', label: 'Cancel Order', style: 'danger' },
  ],
  DELIVERED: [
    { to: 'OUT_FOR_DELIVERY', label: 'Undo Delivery', style: 'secondary' },
  ],
  CANCELLED: [
    { to: 'PENDING', label: 'Reopen Order', style: 'secondary' },
  ],
}

const availableTransitions = computed(() => TRANSITIONS[order.value?.status] ?? [])
const statusClass = computed(() => ['badge', statusMap[order.value?.status]?.cls ?? ''].join(' '))
const statusLabel = computed(() => statusMap[order.value?.status]?.label ?? order.value?.status)

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

async function fetchOrder() {
  try {
    order.value = await adminFetch(`/api/orders/${route.params.id}`)
  } catch {
    order.value = null
  } finally {
    loading.value = false
  }
}

async function updatePaymentStatus(status) {
  updatingPayment.value = status
  updateError.value = ''
  try {
    const updated = await adminFetch(`/api/orders/${order.value.id}/payment`, {
      method: 'PATCH',
      body: { paymentStatus: status, note: paymentNoteInput.value.trim() || undefined },
    })
    order.value = { ...order.value, paymentStatus: status, paymentNote: updated.paymentNote, paymentVerifiedAt: updated.paymentVerifiedAt, paymentVerifiedById: updated.paymentVerifiedById, paymentVerifiedBy: updated.paymentVerifiedBy }
    paymentNoteInput.value = ''
  } catch (e) {
    updateError.value = e?.data?.statusMessage ?? 'Failed to update payment status.'
  } finally {
    updatingPayment.value = null
  }
}

async function handleTransitionClick(status) {
  if (status === 'OUT_FOR_DELIVERY') {
    try {
      // Admin sees ALL delivery staff — no store filter
      deliveryPersons.value = await adminFetch('/api/admin/users?role=delivery')
    } catch { deliveryPersons.value = [] }
    selectedDeliveryPerson.value = order.value?.deliveryPersonId ?? null
    showDispatchModal.value = true
    return
  }
  await updateStatus(status)
}

async function confirmDispatch() {
  if (selectedDeliveryPerson.value) {
    try {
      await adminFetch(`/api/admin/orders/${order.value.id}/assign`, {
        method: 'PATCH',
        body: { deliveryPersonId: selectedDeliveryPerson.value },
      })
    } catch (e) {
      updateError.value = e?.data?.statusMessage ?? 'Failed to assign delivery person.'
      return
    }
  }
  showDispatchModal.value = false
  await updateStatus('OUT_FOR_DELIVERY')
}

async function updateStatus(status) {
  updating.value = true
  pendingStatus.value = status
  updateError.value = ''
  try {
    const updated = await adminFetch(`/api/orders/${order.value.id}/status`, {
      method: 'PATCH',
      body: { status },
    })
    order.value = updated
  } catch (e) {
    updateError.value = e?.data?.statusMessage ?? 'Failed to update status.'
  } finally {
    updating.value = false
    pendingStatus.value = null
  }
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

  map = L.map(mapEl.value, { zoomControl: true, dragging: true, scrollWheelZoom: false }).setView([lat, lng], 16)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`<strong>${order.value.customerName}</strong><br>${order.value.address}`)
    .openPopup()
}

watch(mapEl, async (el) => {
  if (!el || !order.value?.lat || !order.value?.lng || map) return
  await initMap()
}, { flush: 'post' })

onMounted(fetchOrder)

onUnmounted(() => {
  if (map) map.remove()
})

useHead(() => ({ title: order.value ? `Order #${order.value.id} — Admin` : 'Order — Admin' }))
</script>
