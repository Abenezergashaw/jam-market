<template>
  <div class="card p-4 sm:p-5">
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap mb-2">
          <span class="text-sm font-bold text-zinc-100">#{{ order.id }}</span>
          <span :class="statusClass">{{ order.status }}</span>
          <span class="text-xs text-zinc-600">{{ formatDate(order.createdAt) }}</span>
        </div>

        <div class="text-sm space-y-0.5 mb-3">
          <p class="text-zinc-300 font-medium">{{ order.customerName }}
            <span class="text-zinc-500 font-normal"> · {{ order.phone }}</span>
          </p>
          <p class="text-zinc-500 text-xs truncate">{{ order.address }}</p>
          <p v-if="order.notes" class="text-zinc-600 text-xs italic">{{ order.notes }}</p>
        </div>

        <ul class="space-y-1">
          <li
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center gap-2 text-xs text-zinc-500"
          >
            <span class="font-semibold text-zinc-400">×{{ item.quantity }}</span>
            <span>{{ item.product?.name ?? 'Unknown product' }}</span>
            <span class="text-zinc-700 ml-auto">${{ (Number(item.price) * item.quantity).toFixed(2) }}</span>
          </li>
        </ul>
      </div>

      <div class="flex flex-col items-end gap-3 shrink-0">
        <span class="text-base font-bold text-zinc-50">${{ Number(order.totalPrice).toFixed(2) }}</span>
        <div v-if="order.status === 'PENDING'" class="flex gap-2">
          <button
            class="btn-primary text-xs px-3 py-1.5"
            :disabled="loading"
            @click="$emit('confirm', order.id)"
          >
            Confirm
          </button>
          <button
            class="btn-danger text-xs px-3 py-1.5"
            :disabled="loading"
            @click="$emit('cancel', order.id)"
          >
            Cancel
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

defineEmits(['confirm', 'cancel'])

const statusClass = computed(() => {
  const map = { PENDING: 'badge-yellow', CONFIRMED: 'badge-green', CANCELLED: 'badge-red' }
  return ['badge', map[props.order.status] ?? ''].join(' ')
})

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
</script>
