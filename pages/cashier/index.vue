<template>
  <div class="space-y-5">
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div v-for="n in 4" :key="n" class="card h-24 animate-pulse bg-zinc-100" />
    </div>

    <template v-else>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
          <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Pending</p>
          <p class="text-2xl font-bold text-amber-500 mt-1.5">{{ stats.pending }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Awaiting confirmation</p>
        </div>
        <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
          <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Confirmed</p>
          <p class="text-2xl font-bold text-blue-500 mt-1.5">{{ stats.confirmed }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Ready to dispatch</p>
        </div>
        <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
          <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Out for Delivery</p>
          <p class="text-2xl font-bold text-orange-500 mt-1.5">{{ stats.outForDelivery }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">On the way</p>
        </div>
        <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
          <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Delivered Today</p>
          <p class="text-2xl font-bold text-green-600 mt-1.5">{{ stats.deliveredToday }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Completed</p>
        </div>
      </div>

      <!-- Recent orders -->
      <div v-if="recentOrders.length" class="card overflow-hidden">
        <div class="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-zinc-800">Recent Orders</h2>
          <NuxtLink to="/cashier/orders" class="text-xs text-brand-500 hover:text-brand-600 transition-colors">View all</NuxtLink>
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
                <td class="px-4 py-3 text-zinc-400 text-xs">{{ order.items?.length ?? 0 }} item{{ (order.items?.length ?? 0) !== 1 ? 's' : '' }}</td>
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

const loading = ref(true)
const stats = ref({ pending: 0, confirmed: 0, outForDelivery: 0, deliveredToday: 0 })
const recentOrders = ref([])

const statusMap = {
  PENDING: { label: 'Pending', cls: 'badge-yellow' },
  CONFIRMED: { label: 'Confirmed', cls: 'badge-blue' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', cls: 'badge-orange' },
  DELIVERED: { label: 'Delivered', cls: 'badge-green' },
  CANCELLED: { label: 'Cancelled', cls: 'badge-red' },
}

function statusClass(s) { return statusMap[s]?.cls ?? '' }
function statusLabel(s) { return statusMap[s]?.label ?? s }

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
