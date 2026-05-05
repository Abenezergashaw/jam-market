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
        <h3 class="text-sm font-semibold text-zinc-800">
          {{ reassignMode ? 'Reassign Delivery Person' : 'Assign Delivery Person' }}
          <span class="text-zinc-400 font-normal">(optional)</span>
        </h3>

        <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
          <button
            type="button"
            :class="selectedDeliveryPerson === null ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-300' : 'border-zinc-200 hover:border-zinc-300'"
            class="w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors"
            @click="selectedDeliveryPerson = null"
          >
            <span class="text-zinc-400 italic">— No assignment —</span>
          </button>
          <button
            v-for="dp in sortedDeliveryPersons"
            :key="dp.id"
            type="button"
            :class="selectedDeliveryPerson === dp.id ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-300' : 'border-zinc-200 hover:border-zinc-300'"
            class="w-full text-left px-3 py-2.5 rounded-xl border transition-colors"
            @click="selectedDeliveryPerson = dp.id"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium text-zinc-800">{{ dp.name || dp.email }}</span>
              <span v-if="dp.distanceKm != null" class="text-xs text-zinc-400 shrink-0">
                {{ dp.distanceKm.toFixed(1) }} km
                <span v-if="dp.locationFresh" class="text-green-500 ml-1">●</span>
                <span v-else class="text-zinc-300 ml-1">○</span>
              </span>
              <span v-else class="text-xs text-zinc-300 shrink-0">No location</span>
            </div>
          </button>
        </div>

        <div class="flex gap-2">
          <button class="btn-primary text-sm px-4" :disabled="updating" @click="confirmDispatch">
            {{ updating ? '…' : (reassignMode ? 'Save Assignment' : 'Confirm Dispatch') }}
          </button>
          <button class="btn-secondary text-sm px-4" @click="showDispatchModal = false; reassignMode = false">Cancel</button>
        </div>
      </div>

      <!-- Cancel modal -->
      <div v-if="showCancelModal" class="card p-5 border-red-200 bg-red-50/30 space-y-3">
        <h3 class="text-sm font-semibold text-zinc-800">Cancel this order?</h3>
        <div>
          <label class="label text-xs">Reason for cancellation <span class="text-zinc-400 font-normal">(optional)</span></label>
          <textarea v-model="cancelReasonInput" class="input resize-none text-sm" rows="2" maxlength="300" placeholder="e.g. Customer requested cancellation, item out of stock…" />
        </div>
        <p v-if="order.paymentStatus === 'COLLECTED'" class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Payment was already collected — a refund will be marked as pending after cancellation.
        </p>
        <div class="flex gap-2">
          <button class="btn-danger text-sm px-4" :disabled="updating" @click="confirmCancel">
            {{ updating ? '…' : 'Confirm Cancellation' }}
          </button>
          <button class="btn-secondary text-sm px-4" @click="showCancelModal = false">Back</button>
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
            <div class="border-t border-zinc-100 mt-4 pt-3 space-y-1.5">
              <div class="flex items-center justify-between text-sm text-zinc-500">
                <span>Items subtotal</span>
                <span>ETB {{ itemsSubtotal.toFixed(2) }}</span>
              </div>
              <div v-if="Number(order.deliveryFee) > 0" class="flex items-center justify-between text-sm text-zinc-500">
                <span>Delivery fee</span>
                <span>ETB {{ Number(order.deliveryFee).toFixed(2) }}</span>
              </div>
              <div v-if="serviceCharge > 0" class="flex items-center justify-between text-sm text-zinc-500">
                <span>Service charge</span>
                <span>ETB {{ serviceCharge.toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between pt-1.5 border-t border-zinc-100">
                <span class="text-sm font-semibold text-zinc-700">Total</span>
                <span class="text-lg font-bold text-zinc-900">ETB {{ Number(order.totalPrice).toFixed(2) }}</span>
              </div>
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
            <div v-if="canVerifyPayment" class="space-y-2 pt-1">
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

          <!-- Refund card — only for cancelled orders -->
          <div v-if="order.status === 'CANCELLED'" class="card p-5 space-y-4">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-sm font-semibold text-zinc-700 uppercase tracking-wider">Refund</h2>
              <span v-if="order.refundStatus === 'REFUNDED'" class="badge badge-green text-xs">Refunded</span>
              <span v-else-if="order.refundStatus === 'PENDING'" class="badge badge-yellow text-xs">Refund Pending</span>
              <span v-else class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-500">No Refund</span>
            </div>

            <div v-if="order.cancelReason" class="text-xs text-zinc-600 bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2.5">
              <span class="font-semibold">Cancellation reason: </span>{{ order.cancelReason }}
            </div>

            <!-- Pending: show action form -->
            <template v-if="order.refundStatus === 'PENDING'">
              <p class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                Payment was collected. Process the refund then mark it as done below.
              </p>
              <div class="space-y-3">
                <div>
                  <label class="label text-xs">Refund amount (ETB)</label>
                  <input v-model="refundAmountInput" type="number" step="0.01" min="0.01" class="input text-sm" :placeholder="order.totalPrice" />
                  <p class="text-xs text-zinc-400 mt-1">Leave blank to use full total: ETB {{ Number(order.totalPrice).toFixed(2) }}</p>
                </div>
                <div>
                  <label class="label text-xs">Refund note <span class="text-zinc-400 font-normal">(optional)</span></label>
                  <input v-model="refundNoteInput" type="text" maxlength="300" class="input text-sm" placeholder="e.g. Returned via Telebirr to 09xxx" />
                </div>
                <button class="btn-primary text-sm px-4" :disabled="updatingRefund" @click="markRefundDone">
                  {{ updatingRefund ? '…' : 'Mark Refund Done' }}
                </button>
              </div>
            </template>

            <!-- Refunded: show summary -->
            <template v-else-if="order.refundStatus === 'REFUNDED'">
              <div class="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 space-y-1">
                <p><span class="font-semibold">Amount refunded: </span>ETB {{ Number(order.refundAmount).toFixed(2) }}</p>
                <p v-if="order.refundNote"><span class="font-semibold">Note: </span>{{ order.refundNote }}</p>
              </div>
            </template>

            <!-- None: no payment was collected -->
            <template v-else>
              <p class="text-xs text-zinc-400">No payment was collected — no refund needed.</p>
            </template>
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
              <span class="badge badge-orange text-[10px]">Delivery</span>
              <button
                v-if="order.status === 'OUT_FOR_DELIVERY'"
                class="btn-secondary text-xs px-3 py-1.5"
                @click="openReassign"
              >Reassign</button>
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
const reassignMode = ref(false)
const showCancelModal = ref(false)
const cancelReasonInput = ref('')
const refundAmountInput = ref('')
const refundNoteInput = ref('')
const updatingRefund = ref(false)
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

const isCashOrder = computed(() => ['CASH', 'COD'].includes(order.value?.paymentMethod))
const canVerifyPayment = computed(() =>
  order.value?.paymentStatus === 'PENDING' && !isCashOrder.value
)

const itemsSubtotal = computed(() => {
  if (!order.value?.items) return 0
  return order.value.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)
})
const serviceCharge = computed(() => {
  if (!order.value) return 0
  const sc = Number(order.value.totalPrice) - itemsSubtotal.value - Number(order.value.deliveryFee ?? 0)
  return sc > 0.001 ? sc : 0
})

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const LOCATION_FRESH_MS = 5 * 60 * 1000

const sortedDeliveryPersons = computed(() => {
  const storeLat = order.value?.store?.lat ? Number(order.value.store.lat) : null
  const storeLng = order.value?.store?.lng ? Number(order.value.store.lng) : null
  return deliveryPersons.value
    .map((dp) => {
      const hasLocation = dp.lat != null && dp.lng != null
      const locationFresh = hasLocation &&
        dp.locationUpdatedAt &&
        Date.now() - new Date(dp.locationUpdatedAt).getTime() < LOCATION_FRESH_MS
      const distanceKm = hasLocation && storeLat != null && storeLng != null
        ? haversineKm(storeLat, storeLng, Number(dp.lat), Number(dp.lng))
        : null
      return { ...dp, distanceKm, locationFresh }
    })
    .sort((a, b) => {
      if (a.locationFresh && b.locationFresh) return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
      if (a.locationFresh) return -1
      if (b.locationFresh) return 1
      if (a.distanceKm != null && b.distanceKm != null) return a.distanceKm - b.distanceKm
      return a.distanceKm != null ? -1 : 1
    })
})

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
    order.value = updated
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
      deliveryPersons.value = await adminFetch('/api/admin/users?role=delivery')
    } catch { deliveryPersons.value = [] }
    const nearest = sortedDeliveryPersons.value.find((dp) => dp.locationFresh)
    selectedDeliveryPerson.value = nearest?.id ?? order.value?.deliveryPersonId ?? null
    reassignMode.value = false
    showDispatchModal.value = true
    return
  }
  if (status === 'CANCELLED') {
    cancelReasonInput.value = ''
    showCancelModal.value = true
    return
  }
  await updateStatus(status)
}

async function confirmCancel() {
  showCancelModal.value = false
  await updateStatus('CANCELLED', { cancelReason: cancelReasonInput.value.trim() || undefined })
  cancelReasonInput.value = ''
}

async function openReassign() {
  try {
    deliveryPersons.value = await adminFetch('/api/admin/users?role=delivery')
  } catch { deliveryPersons.value = [] }
  selectedDeliveryPerson.value = order.value?.deliveryPersonId ?? null
  reassignMode.value = true
  showDispatchModal.value = true
}

async function confirmDispatch() {
  const isReassign = reassignMode.value
  if (selectedDeliveryPerson.value != null || isReassign) {
    try {
      await adminFetch(`/api/admin/orders/${order.value.id}/assign`, {
        method: 'PATCH',
        body: { deliveryPersonId: selectedDeliveryPerson.value },
      })
      await fetchOrder()
    } catch (e) {
      updateError.value = e?.data?.statusMessage ?? 'Failed to assign delivery person.'
      return
    }
  }
  showDispatchModal.value = false
  reassignMode.value = false
  if (!isReassign) await updateStatus('OUT_FOR_DELIVERY')
}

async function updateStatus(status, extraBody = {}) {
  updating.value = true
  pendingStatus.value = status
  updateError.value = ''
  try {
    const updated = await adminFetch(`/api/orders/${order.value.id}/status`, {
      method: 'PATCH',
      body: { status, ...extraBody },
    })
    order.value = updated
  } catch (e) {
    updateError.value = e?.data?.statusMessage ?? 'Failed to update status.'
  } finally {
    updating.value = false
    pendingStatus.value = null
  }
}

async function markRefundDone() {
  updatingRefund.value = true
  updateError.value = ''
  try {
    const result = await adminFetch(`/api/admin/orders/${order.value.id}/refund`, {
      method: 'PATCH',
      body: {
        refundAmount: refundAmountInput.value ? Number(refundAmountInput.value) : undefined,
        refundNote: refundNoteInput.value.trim() || undefined,
      },
    })
    order.value = { ...order.value, ...result }
  } catch (e) {
    updateError.value = e?.data?.statusMessage ?? 'Failed to mark refund.'
  } finally {
    updatingRefund.value = false
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
