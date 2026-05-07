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
            v-for="tr in availableTransitions"
            :key="tr.to"
            :class="[tr.style === 'primary' ? 'btn-primary' : tr.style === 'danger' ? 'btn-danger' : 'btn-secondary', 'text-xs px-3 py-1.5']"
            :disabled="loading"
            @click="$emit('change-status', order.id, tr.to)"
          >
            {{ tr.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  order: { type: Object, required: true },
  loading: { type: Boolean, default: false },
})

defineEmits(['change-status'])

const { t } = useLocale()

const PM_LABEL = { TELEBIRR: 'Telebirr', CBE: 'CBE', BOA: 'BOA' }

const statusMap = computed(() => ({
  PENDING: { label: t('status.pending'), cls: 'badge-yellow' },
  CONFIRMED: { label: t('status.confirmed'), cls: 'badge-blue' },
  OUT_FOR_DELIVERY: { label: t('status.outForDelivery'), cls: 'badge-orange' },
  DELIVERED: { label: t('status.delivered'), cls: 'badge-green' },
  CANCELLED: { label: t('status.cancelled'), cls: 'badge-red' },
}))

const TRANSITIONS = computed(() => ({
  PENDING: [
    { to: 'CONFIRMED', label: t('admin.confirm'), style: 'primary' },
    { to: 'CANCELLED', label: t('admin.cancel'), style: 'danger' },
  ],
  CONFIRMED: [
    { to: 'OUT_FOR_DELIVERY', label: t('admin.dispatch'), style: 'primary' },
    { to: 'PENDING', label: t('admin.revert'), style: 'secondary' },
    { to: 'CANCELLED', label: t('admin.cancel'), style: 'danger' },
  ],
  OUT_FOR_DELIVERY: [
    { to: 'DELIVERED', label: t('admin.deliver'), style: 'primary' },
    { to: 'CONFIRMED', label: t('admin.return'), style: 'secondary' },
    { to: 'CANCELLED', label: t('admin.cancel'), style: 'danger' },
  ],
  DELIVERED: [
    { to: 'OUT_FOR_DELIVERY', label: t('admin.undo'), style: 'secondary' },
  ],
  CANCELLED: [
    { to: 'PENDING', label: t('admin.reopen'), style: 'secondary' },
  ],
}))

const availableTransitions = computed(() => TRANSITIONS.value[props.order.status] ?? [])
const statusClass = computed(() => ['badge', statusMap.value[props.order.status]?.cls ?? ''].join(' '))
const statusLabel = computed(() => statusMap.value[props.order.status]?.label ?? props.order.status)

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>
