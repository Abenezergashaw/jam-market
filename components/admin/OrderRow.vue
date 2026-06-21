<template>
  <div class="card p-4 sm:p-5 hover:border-zinc-300 hover:shadow-sm transition-all">
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap mb-2.5">
          <span class="text-sm font-bold text-zinc-900 font-mono">#{{ order.id }}</span>
          <span :class="statusClass">{{ statusLabel }}</span>
          <span
            v-if="order.paymentMethod && order.paymentMethod !== 'CASH' && order.paymentMethod !== 'COD'"
            class="badge text-[10px]"
            :class="{
              'badge-yellow': order.paymentStatus === 'PENDING',
              'badge-green': order.paymentStatus === 'COLLECTED',
              'badge-red': order.paymentStatus === 'FAILED',
            }"
          >
            {{ PM_LABEL[order.paymentMethod] ?? order.paymentMethod }} · {{ order.paymentStatus === 'COLLECTED' ? 'Verified' : order.paymentStatus === 'FAILED' ? 'Failed' : 'Unverified' }}
          </span>
          <span class="text-xs text-zinc-400">{{ formatDate(order.createdAt) }}</span>
        </div>

        <div class="text-sm space-y-0.5 mb-3">
          <p class="text-zinc-800 font-medium">
            {{ order.customerName }}
            <span class="text-zinc-500 font-normal"> · {{ order.phone }}</span>
          </p>
          <p class="text-zinc-500 text-xs truncate">{{ order.address }}</p>
          <p v-if="order.notes" class="text-zinc-400 text-xs italic">{{ order.notes }}</p>
        </div>

        <ul class="space-y-2">
          <li v-for="item in order.items" :key="item.id" class="flex items-center gap-2">
            <ProductImage
              :src="item.product?.imageUrl"
              :alt="item.product?.name"
              class="w-8 h-8 rounded-lg object-cover bg-zinc-100 shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-zinc-700 truncate">{{ item.product?.name ?? 'Unknown product' }}</p>
              <p class="text-[11px] text-zinc-400">×{{ item.quantity }}</p>
            </div>
            <span class="text-xs text-zinc-400 shrink-0">ETB {{ (Number(item.price) * item.quantity).toFixed(2) }}</span>
          </li>
        </ul>
      </div>

      <div class="flex flex-col items-end gap-3 shrink-0">
        <span class="text-base font-bold text-zinc-900">ETB {{ Number(order.totalPrice).toFixed(2) }}</span>
        <div class="flex gap-2 flex-wrap justify-end">
          <NuxtLink :to="`/admin/orders/${order.id}`" class="btn-secondary text-xs px-3 py-1.5">
            {{ $t('admin.view') }}
          </NuxtLink>
          <button
            v-if="isAdmin"
            class="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl font-semibold bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-200 hover:border-red-500 transition-colors"
            @click="$emit('delete', order.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  order: { type: Object, required: true },
  isAdmin: { type: Boolean, default: false },
})

defineEmits(['delete'])

const { t } = useLocale()

const PM_LABEL = { TELEBIRR: 'Telebirr', CBE: 'CBE', BOA: 'BOA' }

const statusMap = computed(() => ({
  PENDING: { label: t('status.pending'), cls: 'badge-yellow' },
  CONFIRMED: { label: t('status.confirmed'), cls: 'badge-blue' },
  OUT_FOR_DELIVERY: { label: t('status.outForDelivery'), cls: 'badge-orange' },
  DELIVERED: { label: t('status.delivered'), cls: 'badge-green' },
  CANCELLED: { label: t('status.cancelled'), cls: 'badge-red' },
}))

const statusClass = computed(() => ['badge', statusMap.value[props.order.status]?.cls ?? ''].join(' '))
const statusLabel = computed(() => statusMap.value[props.order.status]?.label ?? props.order.status)

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>
