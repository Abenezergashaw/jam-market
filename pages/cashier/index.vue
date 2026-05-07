<template>
  <div class="space-y-5">
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div v-for="n in 4" :key="n" class="card h-24 animate-pulse bg-zinc-100" />
    </div>

    <template v-else>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
          <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{{ $t('cashier.pending') }}</p>
          <p class="text-2xl font-bold text-amber-500 mt-1.5">{{ stats.pending }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">{{ $t('cashier.awaitingConfirmation') }}</p>
        </div>
        <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
          <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{{ $t('cashier.confirmed') }}</p>
          <p class="text-2xl font-bold text-blue-500 mt-1.5">{{ stats.confirmed }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">{{ $t('cashier.readyToDispatch') }}</p>
        </div>
        <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
          <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{{ $t('cashier.outForDelivery') }}</p>
          <p class="text-2xl font-bold text-orange-500 mt-1.5">{{ stats.outForDelivery }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">{{ $t('cashier.onTheWay') }}</p>
        </div>
        <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
          <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{{ $t('cashier.deliveredToday') }}</p>
          <p class="text-2xl font-bold text-green-600 mt-1.5">{{ stats.deliveredToday }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">{{ $t('cashier.completed') }}</p>
        </div>
      </div>

      <!-- Recent orders -->
      <div v-if="recentOrders.length" class="card overflow-hidden">
        <div class="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-zinc-800">{{ $t('cashier.recentOrders') }}</h2>
          <NuxtLink to="/cashier/orders" class="text-xs text-brand-500 hover:text-brand-600 transition-colors">{{ $t('cashier.viewAll') }}</NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm min-w-[400px]">
            <tbody class="divide-y divide-zinc-100">
              <tr
                v-for="order in recentOrders"
                :key="order.id"
                class="hover:bg-zinc-50 transition-colors cursor-pointer"
                @click="router.push(`/cashier/orders/${order.id}`)"
              >
                <td class="px-4 py-3 text-zinc-400 text-xs font-mono">#{{ order.id }}</td>
                <td class="px-4 py-3 font-medium text-zinc-800">{{ order.customerName }}</td>
                <td class="px-4 py-3 text-zinc-400 text-xs">{{ $t('common.items', { n: order.items?.length ?? 0 }) }}</td>
                <td class="px-4 py-3">
                  <span class="badge text-[10px]" :class="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
                </td>
                <td class="px-4 py-3 text-zinc-400 text-xs">{{ new Date(order.createdAt).toLocaleDateString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['cashier'], layout: 'cashier', ssr: false })

const router = useRouter()
const { adminFetch } = useAdminFetch()
const { t } = useI18n()

const loading = ref(true)
const stats = ref({ pending: 0, confirmed: 0, outForDelivery: 0, deliveredToday: 0 })
const recentOrders = ref([])

const statusMap = computed(() => ({
  PENDING: { label: t('status.pending'), cls: 'badge-yellow' },
  CONFIRMED: { label: t('status.confirmed'), cls: 'badge-blue' },
  OUT_FOR_DELIVERY: { label: t('status.outForDelivery'), cls: 'badge-orange' },
  DELIVERED: { label: t('status.delivered'), cls: 'badge-green' },
  CANCELLED: { label: t('status.cancelled'), cls: 'badge-red' },
}))

function statusClass(s) { return statusMap.value[s]?.cls ?? '' }
function statusLabel(s) { return statusMap.value[s]?.label ?? s }

async function load() {
  try {
    const result = await adminFetch('/api/orders?limit=50')
    const orders = result.data ?? []
    const today = new Date().toDateString()
    stats.value = {
      pending: orders.filter(o => o.status === 'PENDING').length,
      confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
      outForDelivery: orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length,
      deliveredToday: orders.filter(o => o.status === 'DELIVERED' && new Date(o.createdAt).toDateString() === today).length,
    }
    recentOrders.value = orders.slice(0, 10)
  } catch {}
  loading.value = false
}

onMounted(load)

useHead({ title: 'Dashboard — Cashier' })
</script>
