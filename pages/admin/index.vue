<template>
  <div class="space-y-6">

    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div v-for="n in 8" :key="n" class="card h-24 animate-pulse bg-zinc-800" />
      </div>
    </div>

    <template v-else-if="stats">
      <!-- Row 1: Orders & Revenue -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="card p-4">
          <p class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Total Orders</p>
          <p class="text-2xl font-bold text-zinc-50 mt-1.5">{{ stats?.totalOrders }}</p>
          <p class="text-xs text-zinc-600 mt-0.5">All time</p>
        </div>
        <div class="card p-4">
          <p class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Today</p>
          <p class="text-2xl font-bold text-zinc-50 mt-1.5">{{ stats?.todayOrders }}</p>
          <p class="text-xs text-zinc-600 mt-0.5">Orders today</p>
        </div>
        <div class="card p-4">
          <p class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Revenue</p>
          <p class="text-2xl font-bold text-brand-400 mt-1.5">${{ Number(stats?.revenue ?? 0).toFixed(2) }}</p>
          <p class="text-xs text-zinc-600 mt-0.5">Confirmed only</p>
        </div>
        <div class="card p-4">
          <p class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Today Revenue</p>
          <p class="text-2xl font-bold text-brand-400 mt-1.5">${{ Number(stats?.todayRevenue ?? 0).toFixed(2) }}</p>
          <p class="text-xs text-zinc-600 mt-0.5">Confirmed today</p>
        </div>
      </div>

      <!-- Row 2: Inventory & Catalogue -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="card p-4">
          <p class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Pending</p>
          <p class="text-2xl font-bold text-amber-400 mt-1.5">{{ stats?.pendingOrders }}</p>
          <p class="text-xs text-zinc-600 mt-0.5">Awaiting confirmation</p>
        </div>
        <div class="card p-4">
          <p class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Products</p>
          <p class="text-2xl font-bold text-zinc-50 mt-1.5">{{ stats?.totalProducts }}</p>
          <p class="text-xs text-zinc-600 mt-0.5">{{ stats?.totalCategories }} categories</p>
        </div>
        <div class="card p-4">
          <p class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Low Stock</p>
          <p class="text-2xl font-bold mt-1.5" :class="stats?.lowStockCount > 0 ? 'text-amber-400' : 'text-zinc-50'">{{ stats?.lowStockCount }}</p>
          <p class="text-xs text-zinc-600 mt-0.5">Items running low</p>
        </div>
        <div class="card p-4">
          <p class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Out of Stock</p>
          <p class="text-2xl font-bold mt-1.5" :class="stats?.outOfStockCount > 0 ? 'text-red-400' : 'text-zinc-50'">{{ stats?.outOfStockCount }}</p>
          <p class="text-xs text-zinc-600 mt-0.5">Need restocking</p>
        </div>
      </div>

      <!-- Recent Orders -->
      <div v-if="stats?.recentOrders?.length" class="card overflow-hidden">
        <div class="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-zinc-200">Recent Orders</h2>
          <NuxtLink to="/admin/orders" class="text-xs text-brand-400 hover:text-brand-300 transition-colors">View all</NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm min-w-[480px]">
            <tbody class="divide-y divide-zinc-800/60">
              <tr v-for="order in stats.recentOrders" :key="order.id" class="hover:bg-zinc-800/30 transition-colors">
                <td class="px-4 py-3 text-zinc-400 text-xs font-mono">#{{ order.id }}</td>
                <td class="px-4 py-3 font-medium text-zinc-200">{{ order.customerName }}</td>
                <td class="px-4 py-3 text-zinc-500 text-xs">{{ order.itemCount }} item{{ order.itemCount !== 1 ? 's' : '' }}</td>
                <td class="px-4 py-3 font-semibold text-zinc-200">${{ Number(order.totalPrice).toFixed(2) }}</td>
                <td class="px-4 py-3">
                  <span
                    class="badge text-[10px]"
                    :class="order.status === 'CONFIRMED' ? 'badge-green' : order.status === 'CANCELLED' ? 'badge-red' : 'badge-yellow'"
                  >
                    {{ order.status.toLowerCase() }}
                  </span>
                </td>
                <td class="px-4 py-3 text-zinc-600 text-xs">{{ new Date(order.createdAt).toLocaleDateString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Low Stock Alert -->
      <div v-if="stats?.lowStockProducts?.length" class="card p-5">
        <h2 class="font-semibold text-zinc-100 mb-3 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Low Stock Alert
          <NuxtLink to="/admin/products/low-stock" class="ml-auto text-xs text-brand-400 hover:text-brand-300 transition-colors">Manage stock</NuxtLink>
        </h2>
        <ul class="space-y-1">
          <li
            v-for="p in stats.lowStockProducts"
            :key="p.id"
            class="flex items-center justify-between py-2.5 border-b border-zinc-800 last:border-0"
          >
            <div>
              <span class="text-sm font-medium text-zinc-200">{{ p.name }}</span>
              <span class="text-xs text-zinc-600 ml-2">{{ p.category?.name }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="badge" :class="p.stock === 0 ? 'badge-red' : 'badge-yellow'">
                {{ p.stock === 0 ? 'Out of stock' : `${p.stock} left` }}
              </span>
              <NuxtLink :to="`/admin/products/${p.id}`" class="text-xs text-brand-400 hover:text-brand-300 transition-colors">Edit</NuxtLink>
            </div>
          </li>
        </ul>
      </div>
    </template>

    <div v-else-if="error" class="card p-5 text-red-400 text-sm">Failed to load dashboard. Check your connection.</div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const { adminFetch } = useAdminFetch()
const { data: stats, pending, error } = useAsyncData('stats', () => adminFetch('/api/dashboard/stats'))

useHead({ title: 'Dashboard — Admin' })
</script>
