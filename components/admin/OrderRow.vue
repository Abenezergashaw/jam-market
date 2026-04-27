<template>
  <div class="card p-4 sm:p-5 hover:border-zinc-300 hover:shadow-sm transition-all">
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap mb-2.5">
          <span class="text-sm font-bold text-zinc-900 font-mono">#{{ order.id }}</span>
          <span :class="statusClass">{{ statusLabel }}</span>
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

        <ul class="space-y-1">
          <li v-for="item in order.items" :key="item.id" class="flex items-center gap-2 text-xs text-zinc-500">
            <span class="font-semibold text-zinc-400">×{{ item.quantity }}</span>
            <span>{{ item.product?.name ?? 'Unknown product' }}</span>
            <span class="text-zinc-400 ml-auto">ETB {{ (Number(item.price) * item.quantity).toFixed(2) }}</span>
          </li>
        </ul>
      </div>

      <div class="flex flex-col items-end gap-3 shrink-0">
        <span class="text-base font-bold text-zinc-900">ETB {{ Number(order.totalPrice).toFixed(2) }}</span>
        <div class="flex gap-2 flex-wrap justify-end">
          <NuxtLink :to="`/admin/orders/${order.id}`" class="btn-secondary text-xs px-3 py-1.5">
            View
          </NuxtLink>
          <button
            v-for="t in availableTransitions"
            :key="t.to"
            :class="[t.style === 'primary' ? 'btn-primary' : t.style === 'danger' ? 'btn-danger' : 'btn-secondary', 'text-xs px-3 py-1.5']"
            :disabled="loading"
            @click="$emit('change-status', order.id, t.to)"
          >
            {{ t.label }}
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

const statusMap = {
  PENDING: { label: 'Pending', cls: 'badge-yellow' },
  CONFIRMED: { label: 'Confirmed', cls: 'badge-blue' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', cls: 'badge-orange' },
  DELIVERED: { label: 'Delivered', cls: 'badge-green' },
  CANCELLED: { label: 'Cancelled', cls: 'badge-red' },
}

const TRANSITIONS = {
  PENDING: [
    { to: 'CONFIRMED', label: 'Confirm', style: 'primary' },
    { to: 'CANCELLED', label: 'Cancel', style: 'danger' },
  ],
  CONFIRMED: [
    { to: 'OUT_FOR_DELIVERY', label: 'Dispatch', style: 'primary' },
    { to: 'PENDING', label: 'Revert', style: 'secondary' },
    { to: 'CANCELLED', label: 'Cancel', style: 'danger' },
  ],
  OUT_FOR_DELIVERY: [
    { to: 'DELIVERED', label: 'Delivered', style: 'primary' },
    { to: 'CONFIRMED', label: 'Return', style: 'secondary' },
    { to: 'CANCELLED', label: 'Cancel', style: 'danger' },
  ],
  DELIVERED: [
    { to: 'OUT_FOR_DELIVERY', label: 'Undo', style: 'secondary' },
  ],
  CANCELLED: [
    { to: 'PENDING', label: 'Reopen', style: 'secondary' },
  ],
}

const availableTransitions = computed(() => TRANSITIONS[props.order.status] ?? [])
const statusClass = computed(() => ['badge', statusMap[props.order.status]?.cls ?? ''].join(' '))
const statusLabel = computed(() => statusMap[props.order.status]?.label ?? props.order.status)

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>
