<template>
  <div class="max-w-2xl mx-auto px-4 py-8 sm:py-10">
    <h1 class="text-2xl font-bold text-zinc-900 mb-7 tracking-tight">My Orders</h1>

    <div v-if="myOrdersStore.loading && !myOrdersStore.orders.length" class="space-y-4">
      <div v-for="n in 3" :key="n" class="card p-5 h-40 animate-pulse bg-zinc-50" />
    </div>

    <div v-else-if="!myOrdersStore.orders.length" class="text-center py-20">
      <div class="w-16 h-16 bg-zinc-100 border border-zinc-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p class="text-zinc-500 mb-5">No orders yet.</p>
      <NuxtLink to="/" class="btn-primary">Start shopping</NuxtLink>
    </div>

    <ul v-else class="space-y-4">
      <li v-for="order in myOrdersStore.orders" :key="order.id" class="card p-5 hover:border-zinc-300 hover:shadow-sm transition-all">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-bold text-zinc-900">Order #{{ order.id }}</span>
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

        <!-- Confirm receipt CTA — shown when order is out for delivery -->
        <div v-if="order.status === 'OUT_FOR_DELIVERY'" class="mb-4">
          <template v-if="confirmingId === order.id">
            <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <p class="text-sm font-semibold text-amber-900">Confirm you received order #{{ order.id }}?</p>
              <p class="text-xs text-amber-700 leading-relaxed">Only confirm after you physically receive all your items. This cannot be undone.</p>
              <div class="flex gap-2">
                <button
                  class="btn-primary text-sm px-4 flex-1"
                  :disabled="confirming"
                  @click="doConfirm(order.id)"
                >
                  {{ confirming ? 'Confirming…' : '✓ Yes, I received it' }}
                </button>
                <button class="btn-secondary text-sm px-4" :disabled="confirming" @click="confirmingId = null">
                  Cancel
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
              I received my order
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
            <img
              :src="item.product?.imageUrl"
              :alt="item.product?.name"
              class="w-10 h-10 rounded-xl object-cover bg-zinc-100 shrink-0"
              @error="$event.target.src = 'https://picsum.photos/40/40'"
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
      </li>
    </ul>
  </div>
</template>

<script setup>
const myOrdersStore = useCustomerOrdersStore()
const customerStore = useCustomerStore()

const confirmingId = ref(null)
const confirming = ref(false)

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

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'OUT_FOR_DELIVERY', label: 'On the way' },
  { key: 'DELIVERED', label: 'Delivered' },
]

const STATUS_ORDER = STATUS_STEPS.map((s) => s.key)

function stepIndex(status) {
  const i = STATUS_ORDER.indexOf(status)
  return i === -1 ? 0 : i
}

const PM_LABEL = { TELEBIRR: 'Telebirr', CBE: 'CBE', BOA: 'BOA' }

const statusLabels = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

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
