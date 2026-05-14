<template>
  <div class="max-w-2xl mx-auto px-4 py-8 sm:py-10">
    <h1 class="text-2xl font-bold text-zinc-900 mb-7 tracking-tight">{{ $t('orders.title') }}</h1>

    <div v-if="myOrdersStore.loading && !myOrdersStore.orders.length" class="space-y-4">
      <div v-for="n in 3" :key="n" class="card p-5 h-40 animate-pulse bg-zinc-50" />
    </div>

    <div v-else-if="!myOrdersStore.orders.length" class="text-center py-20">
      <div class="w-16 h-16 bg-zinc-100 border border-zinc-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p class="text-zinc-500 mb-5">{{ $t('orders.noOrders') }}</p>
      <NuxtLink to="/" class="btn-primary">{{ $t('orders.startShopping') }}</NuxtLink>
    </div>

    <ul v-else class="space-y-4">
      <li v-for="order in myOrdersStore.orders" :key="order.id" class="card p-5 hover:border-zinc-300 hover:shadow-sm transition-all">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-bold text-zinc-900">{{ $t('orders.orderNumber', { id: order.id }) }}</span>
              <span
                class="badge"
                :class="{
                  'badge-yellow': order.status === 'PENDING',
                  'badge-blue': order.status === 'CONFIRMED',
                  'badge-orange': order.status === 'OUT_FOR_DELIVERY',
                  'badge-green': order.status === 'DELIVERED',
                  'badge-red': order.status === 'CANCELLED',
                }"
              >{{ statusLabels[order.status] ?? order.status }}</span>
            </div>
            <p class="text-xs text-zinc-400 mt-1">{{ formatDate(order.createdAt) }}</p>
          </div>
          <span class="text-base font-bold text-zinc-900 shrink-0">ETB {{ Number(order.totalPrice).toFixed(2) }}</span>
        </div>

        <!-- Status progress bar (only for non-cancelled orders) -->
        <div v-if="order.status !== 'CANCELLED'" class="mb-4">
          <div class="flex items-center gap-0">
            <template v-for="(step, i) in STATUS_STEPS" :key="step.key">
              <div class="flex flex-col items-center gap-1 flex-1 min-w-0">
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors"
                  :class="stepIndex(order.status) >= i
                    ? 'bg-brand-500 text-white'
                    : 'bg-zinc-100 text-zinc-400'"
                >
                  <svg v-if="stepIndex(order.status) > i" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span v-else>{{ i + 1 }}</span>
                </div>
                <span class="text-[10px] text-zinc-400 text-center leading-tight hidden sm:block">{{ step.label }}</span>
              </div>
              <div
                v-if="i < STATUS_STEPS.length - 1"
                class="h-0.5 flex-1 mb-4 transition-colors"
                :class="stepIndex(order.status) > i ? 'bg-brand-500' : 'bg-zinc-100'"
              />
            </template>
          </div>
        </div>

        <!-- Live delivery tracker — shown when order is out for delivery with an assigned person -->
        <OrderDeliveryTracker
          v-if="order.status === 'OUT_FOR_DELIVERY' && order.deliveryPersonId"
          :order-id="order.id"
          class="mb-4"
        />

        <!-- Confirm receipt CTA — shown when order is out for delivery -->
        <div v-if="order.status === 'OUT_FOR_DELIVERY'" class="mb-4">
          <template v-if="confirmingId === order.id">
            <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <p class="text-sm font-semibold text-amber-900">{{ $t('orders.confirmReceived', { id: order.id }) }}</p>
              <p class="text-xs text-amber-700 leading-relaxed">{{ $t('orders.confirmWarning') }}</p>
              <div class="flex gap-2">
                <button
                  class="btn-primary text-sm px-4 flex-1"
                  :disabled="confirming"
                  @click="doConfirm(order.id)"
                >
                  {{ confirming ? $t('orders.confirming') : $t('orders.yesReceived') }}
                </button>
                <button class="btn-secondary text-sm px-4" :disabled="confirming" @click="confirmingId = null">
                  {{ $t('orders.cancel') }}
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <button
              class="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-brand-300 bg-brand-50 hover:bg-brand-100 px-4 py-3 text-sm font-semibold text-brand-700 transition-colors"
              @click="confirmingId = order.id"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {{ $t('orders.iReceived') }}
            </button>
          </template>
        </div>

        <!-- Payment status — only shown for online payment orders -->
        <div
          v-if="order.paymentMethod && order.paymentMethod !== 'CASH' && order.paymentMethod !== 'COD'"
          class="mb-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium"
          :class="{
            'bg-amber-50 border border-amber-200 text-amber-700': order.paymentStatus === 'PENDING',
            'bg-green-50 border border-green-200 text-green-700': order.paymentStatus === 'COLLECTED',
            'bg-red-50 border border-red-200 text-red-700': order.paymentStatus === 'FAILED',
          }"
        >
          <!-- Icon -->
          <svg v-if="order.paymentStatus === 'COLLECTED'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else-if="order.paymentStatus === 'FAILED'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span v-if="order.paymentStatus === 'COLLECTED'">
              {{ PM_LABEL[order.paymentMethod] }} payment verified
            </span>
            <span v-else-if="order.paymentStatus === 'FAILED'">
              {{ PM_LABEL[order.paymentMethod] }} payment failed — please contact us
            </span>
            <span v-else>
              {{ PM_LABEL[order.paymentMethod] }} payment pending verification
            </span>
          </div>
        </div>

        <ul class="space-y-2 mb-4">
          <li
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center gap-3"
          >
            <ProductImage
              :src="item.product?.imageUrl"
              :alt="item.product?.name"
              class="w-10 h-10 rounded-xl object-cover bg-zinc-100 shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-zinc-900 truncate">{{ item.product?.name ?? 'Product' }}</p>
              <p class="text-xs text-zinc-400">×{{ item.quantity }}</p>
            </div>
            <span class="text-sm font-semibold text-zinc-700 shrink-0">ETB {{ (Number(item.price) * item.quantity).toFixed(2) }}</span>
          </li>
        </ul>

        <p class="text-xs text-zinc-400 border-t border-zinc-100 pt-3 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {{ order.address }}
        </p>

        <!-- Actions row -->
        <div class="flex items-center gap-2 pt-3 border-t border-zinc-100 mt-3">
          <button
            class="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 rounded-xl px-3 py-2.5 transition-colors"
            @click="viewOrder = order"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            View details
          </button>
          <button
            v-if="order.status !== 'CANCELLED' && order.status !== 'DELIVERED'"
            class="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl px-3 py-2.5 transition-colors"
            :disabled="cancellingId === order.id"
            @click="cancelOrder(order)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            {{ cancellingId === order.id ? 'Cancelling…' : 'Cancel order' }}
          </button>
        </div>
      </li>
    </ul>

    <!-- Order detail sheet -->
    <Teleport to="body">
      <Transition name="sheet">
        <div v-if="viewOrder" class="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center" @click.self="viewOrder = null">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="viewOrder = null" />
          <div class="relative bg-white w-full sm:max-w-lg sm:mx-4 sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <!-- Handle -->
            <div class="flex justify-center pt-3 pb-1 sm:hidden">
              <div class="w-10 h-1 bg-zinc-200 rounded-full" />
            </div>
            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
              <div>
                <p class="font-bold text-zinc-900">Order #{{ viewOrder.id }}</p>
                <p class="text-xs text-zinc-400 mt-0.5">{{ formatDate(viewOrder.createdAt) }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="badge" :class="{
                  'badge-yellow': viewOrder.status === 'PENDING',
                  'badge-blue': viewOrder.status === 'CONFIRMED',
                  'badge-orange': viewOrder.status === 'OUT_FOR_DELIVERY',
                  'badge-green': viewOrder.status === 'DELIVERED',
                  'badge-red': viewOrder.status === 'CANCELLED',
                }">{{ statusLabels[viewOrder.status] ?? viewOrder.status }}</span>
                <button class="p-1.5 text-zinc-400 hover:text-zinc-700 transition-colors" @click="viewOrder = null">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <!-- Body -->
            <div class="overflow-y-auto flex-1 px-5 py-4 space-y-5">
              <!-- Items -->
              <div>
                <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Items</p>
                <ul class="space-y-3">
                  <li v-for="item in viewOrder.items" :key="item.id" class="flex items-center gap-3">
                    <ProductImage :src="item.product?.imageUrl" :alt="item.product?.name" class="w-11 h-11 rounded-xl object-cover bg-zinc-100 shrink-0" />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-zinc-900 truncate">{{ item.product?.name ?? 'Product' }}</p>
                      <p class="text-xs text-zinc-400">×{{ item.quantity }} · ETB {{ Number(item.price).toFixed(2) }} each</p>
                    </div>
                    <span class="text-sm font-semibold text-zinc-700 shrink-0">ETB {{ (Number(item.price) * item.quantity).toFixed(2) }}</span>
                  </li>
                </ul>
              </div>

              <!-- Price breakdown -->
              <div class="border-t border-zinc-100 pt-4 space-y-2">
                <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Summary</p>
                <div class="flex justify-between text-sm text-zinc-500">
                  <span>Items subtotal</span>
                  <span>ETB {{ viewOrderSubtotal.toFixed(2) }}</span>
                </div>
                <div v-if="Number(viewOrder.deliveryFee) - Number(viewOrder.serviceCharge ?? 0) > 0" class="flex justify-between text-sm text-zinc-500">
                  <span>Delivery fee</span>
                  <span>ETB {{ (Number(viewOrder.deliveryFee) - Number(viewOrder.serviceCharge ?? 0)).toFixed(2) }}</span>
                </div>
                <div v-if="Number(viewOrder.serviceCharge) > 0" class="flex justify-between text-sm text-zinc-500">
                  <span>Service charge</span>
                  <span>ETB {{ Number(viewOrder.serviceCharge).toFixed(2) }}</span>
                </div>
                <div v-if="Number(viewOrder.discountAmount) > 0" class="flex justify-between text-sm text-brand-600 font-semibold">
                  <span>🎁 Promotion discount</span>
                  <span>−ETB {{ Number(viewOrder.discountAmount).toFixed(2) }}</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-zinc-100">
                  <span class="font-bold text-zinc-900">Total</span>
                  <span class="font-bold text-zinc-900">ETB {{ Number(viewOrder.totalPrice).toFixed(2) }}</span>
                </div>
              </div>

              <!-- Delivery info -->
              <div class="border-t border-zinc-100 pt-4 space-y-2">
                <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Delivery</p>
                <div class="flex gap-2 text-sm text-zinc-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 mt-0.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>{{ viewOrder.address }}</span>
                </div>
                <div v-if="viewOrder.notes" class="flex gap-2 text-sm text-zinc-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 mt-0.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                  <span class="italic">{{ viewOrder.notes }}</span>
                </div>
              </div>

              <!-- Payment -->
              <div class="border-t border-zinc-100 pt-4">
                <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Payment</p>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-zinc-600">{{ PM_LABEL[viewOrder.paymentMethod] ?? viewOrder.paymentMethod }}</span>
                  <span class="font-medium" :class="viewOrder.paymentStatus === 'COLLECTED' ? 'text-green-600' : viewOrder.paymentStatus === 'FAILED' ? 'text-red-500' : 'text-amber-600'">
                    {{ viewOrder.paymentStatus === 'COLLECTED' ? 'Verified' : viewOrder.paymentStatus === 'FAILED' ? 'Failed' : 'Pending' }}
                  </span>
                </div>
              </div>

              <!-- Cancel reason -->
              <div v-if="viewOrder.status === 'CANCELLED' && viewOrder.cancelReason" class="border-t border-zinc-100 pt-4">
                <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Cancellation reason</p>
                <p class="text-sm text-zinc-600 italic">{{ viewOrder.cancelReason }}</p>
              </div>
            </div>

            <!-- Footer action -->
            <div v-if="viewOrder.status !== 'CANCELLED' && viewOrder.status !== 'DELIVERED'" class="px-5 py-4 border-t border-zinc-100">
              <button
                class="w-full flex items-center justify-center gap-2 text-sm font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl px-4 py-3 transition-colors"
                :disabled="cancellingId === viewOrder.id"
                @click="cancelOrder(viewOrder)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                {{ cancellingId === viewOrder.id ? 'Cancelling…' : 'Cancel this order' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Cancel confirmation modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="cancelTarget" class="fixed inset-0 z-[10000] flex items-center justify-center p-4" @click.self="cancelTarget = null">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cancelTarget = null" />
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 class="text-base font-bold text-zinc-900 mb-1">Cancel order #{{ cancelTarget.id }}?</h3>
            <p class="text-sm text-zinc-500 mb-6">This cannot be undone. Your items will be restocked.</p>
            <div class="flex gap-3">
              <button class="flex-1 btn-secondary" :disabled="cancellingId === cancelTarget.id" @click="cancelTarget = null">Keep order</button>
              <button class="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60" :disabled="cancellingId === cancelTarget.id" @click="doCancel">
                {{ cancellingId === cancelTarget.id ? 'Cancelling…' : 'Yes, cancel' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
const myOrdersStore = useCustomerOrdersStore()
const customerStore = useCustomerStore()
const { t } = useLocale()

const confirmingId = ref(null)
const confirming = ref(false)
const viewOrder = ref(null)
const cancellingId = ref(null)
const cancelTarget = ref(null)

const viewOrderSubtotal = computed(() => {
  if (!viewOrder.value?.items) return 0
  return viewOrder.value.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0)
})

function cancelOrder(order) {
  cancelTarget.value = order
}

async function doCancel() {
  const order = cancelTarget.value
  if (!order) return
  cancellingId.value = order.id
  try {
    await $fetch(`/api/customer/orders/${order.id}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerStore.token}` },
    })
    const o = myOrdersStore.orders.find((x) => x.id === order.id)
    if (o) o.status = 'CANCELLED'
    if (viewOrder.value?.id === order.id) viewOrder.value = { ...viewOrder.value, status: 'CANCELLED' }
    myOrdersStore._persist()
    cancelTarget.value = null
  } catch (e) {
    cancelTarget.value = null
    alert(e?.data?.statusMessage ?? 'Failed to cancel order. Please try again.')
  } finally {
    cancellingId.value = null
  }
}

async function doConfirm(orderId) {
  confirming.value = true
  try {
    await $fetch(`/api/customer/orders/${orderId}/confirm-delivery`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerStore.token}` },
    })
    const order = myOrdersStore.orders.find((o) => o.id === orderId)
    if (order) order.status = 'DELIVERED'
    myOrdersStore._persist()
    confirmingId.value = null
  } catch (e) {
    alert(e?.data?.statusMessage ?? 'Failed to confirm receipt. Please try again.')
  } finally {
    confirming.value = false
  }
}

const STATUS_STEPS = computed(() => [
  { key: 'PENDING', label: t('status.placed') },
  { key: 'CONFIRMED', label: t('status.confirmed') },
  { key: 'OUT_FOR_DELIVERY', label: t('status.onTheWay') },
  { key: 'DELIVERED', label: t('status.delivered') },
])

const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED']

function stepIndex(status) {
  const i = STATUS_ORDER.indexOf(status)
  return i === -1 ? 0 : i
}

const PM_LABEL = { TELEBIRR: 'Telebirr', CBE: 'CBE', BOA: 'BOA' }

const statusLabels = computed(() => ({
  PENDING: t('status.pending'),
  CONFIRMED: t('status.confirmed'),
  OUT_FOR_DELIVERY: t('status.outForDelivery'),
  DELIVERED: t('status.delivered'),
  CANCELLED: t('status.cancelled'),
}))

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

let pollInterval = null

onMounted(() => {
  myOrdersStore.hydrate()
  if (customerStore.isAuthenticated) {
    pollInterval = setInterval(() => myOrdersStore.fetchFromServer(), 30_000)
  }
})

onUnmounted(() => clearInterval(pollInterval))

useHead({ title: 'My Orders — Jam Store' })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-active .relative, .fade-leave-active .relative { transition: transform 0.2s ease; }
.fade-enter-from .relative, .fade-leave-to .relative { transform: scale(0.95); }

.sheet-enter-active, .sheet-leave-active { transition: opacity 0.25s ease; }
.sheet-enter-active .relative, .sheet-leave-active .relative { transition: transform 0.3s cubic-bezier(0.32,0.72,0,1); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .relative, .sheet-leave-to .relative { transform: translateY(100%); }
@media (min-width: 640px) {
  .sheet-enter-from .relative, .sheet-leave-to .relative { transform: translateY(20px) scale(0.97); }
}
</style>
