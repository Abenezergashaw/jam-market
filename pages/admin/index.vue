<template>
  <div class="space-y-6">

    <!-- Loading -->
    <div v-if="pending" class="space-y-4">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div v-for="n in 8" :key="n" class="card h-24 animate-pulse bg-zinc-100" />
      </div>
    </div>

    <template v-else-if="stats">
      <!-- Row 1: Orders & Revenue -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
          <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{{ $t('admin.totalOrders') }}</p>
          <p class="text-2xl font-bold text-zinc-900 mt-1.5">{{ stats?.totalOrders }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">{{ $t('admin.allTime') }}</p>
        </div>
        <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
          <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{{ $t('admin.today') }}</p>
          <p class="text-2xl font-bold text-zinc-900 mt-1.5">{{ stats?.todayOrders }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">{{ $t('admin.ordersToday') }}</p>
        </div>
        <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
          <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{{ $t('admin.revenue') }}</p>
          <p class="text-2xl font-bold text-brand-500 mt-1.5">ETB {{ Number(stats?.revenue ?? 0).toFixed(2) }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">{{ $t('admin.exclPendingCancelled') }}</p>
        </div>
        <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
          <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{{ $t('admin.todayRevenue') }}</p>
          <p class="text-2xl font-bold text-brand-500 mt-1.5">ETB {{ Number(stats?.todayRevenue ?? 0).toFixed(2) }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">{{ $t('admin.confirmedToday') }}</p>
        </div>
      </div>

      <!-- Row 2: Inventory & Catalogue -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
          <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{{ $t('admin.pending') }}</p>
          <p class="text-2xl font-bold text-amber-500 mt-1.5">{{ stats?.pendingOrders }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">{{ $t('admin.awaitingConfirmation') }}</p>
        </div>
        <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
          <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{{ $t('admin.products') }}</p>
          <p class="text-2xl font-bold text-zinc-900 mt-1.5">{{ stats?.totalProducts }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">{{ stats?.totalCategories }} {{ $t('admin.nav.categories') }}</p>
        </div>
        <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
          <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{{ $t('admin.lowStockCount') }}</p>
          <p class="text-2xl font-bold mt-1.5" :class="stats?.lowStockCount > 0 ? 'text-amber-500' : 'text-zinc-900'">{{ stats?.lowStockCount }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">{{ $t('admin.itemsRunningLow') }}</p>
        </div>
        <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
          <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{{ $t('admin.outOfStock') }}</p>
          <p class="text-2xl font-bold mt-1.5" :class="stats?.outOfStockCount > 0 ? 'text-brand-500' : 'text-zinc-900'">{{ stats?.outOfStockCount }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">{{ $t('admin.needRestocking') }}</p>
        </div>
      </div>

      <!-- Recent Orders -->
      <div v-if="stats?.recentOrders?.length" class="card overflow-hidden">
        <div class="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-zinc-800">{{ $t('admin.recentOrders') }}</h2>
          <NuxtLink to="/admin/orders" class="text-xs text-brand-500 hover:text-brand-600 transition-colors">{{ $t('admin.viewAll') }}</NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm min-w-[480px]">
            <tbody class="divide-y divide-zinc-100">
              <tr v-for="order in stats.recentOrders" :key="order.id" class="hover:bg-zinc-50 transition-colors">
                <td class="px-4 py-3 text-zinc-400 text-xs font-mono">#{{ order.id }}</td>
                <td class="px-4 py-3 font-medium text-zinc-800">{{ order.customerName }}</td>
                <td class="px-4 py-3 text-zinc-400 text-xs">{{ $t('common.items', { n: order.itemCount }) }}</td>
                <td class="px-4 py-3 font-semibold text-zinc-800">ETB {{ Number(order.totalPrice).toFixed(2) }}</td>
                <td class="px-4 py-3">
                  <span
                    class="badge text-[10px]"
                    :class="{
                      'badge-yellow': order.status === 'PENDING',
                      'badge-blue': order.status === 'CONFIRMED',
                      'badge-orange': order.status === 'OUT_FOR_DELIVERY',
                      'badge-green': order.status === 'DELIVERED',
                      'badge-red': order.status === 'CANCELLED',
                    }"
                  >
                    {{ { PENDING: $t('status.pending'), CONFIRMED: $t('status.confirmed'), OUT_FOR_DELIVERY: $t('status.outForDelivery'), DELIVERED: $t('status.delivered'), CANCELLED: $t('status.cancelled') }[order.status] ?? order.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-zinc-400 text-xs">{{ new Date(order.createdAt).toLocaleDateString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Low Stock Alert -->
      <div v-if="stats?.lowStockProducts?.length" class="card p-5">
        <h2 class="font-semibold text-zinc-800 mb-3 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          {{ $t('admin.lowStockAlert') }}
          <NuxtLink to="/admin/products/low-stock" class="ml-auto text-xs text-brand-500 hover:text-brand-600 transition-colors">{{ $t('admin.manageStock') }}</NuxtLink>
        </h2>
        <ul class="space-y-1">
          <li
            v-for="p in stats.lowStockProducts"
            :key="p.id"
            class="flex items-center justify-between py-2.5 border-b border-zinc-100 last:border-0"
          >
            <div>
              <span class="text-sm font-medium text-zinc-800">{{ p.name }}</span>
              <span class="text-xs text-zinc-400 ml-2">{{ p.category?.name }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="badge" :class="p.stock === 0 ? 'badge-red' : 'badge-yellow'">
                {{ p.stock === 0 ? $t('admin.outOfStockBadge') : $t('product.left', { n: p.stock }) }}
              </span>
              <NuxtLink :to="`/admin/products/${p.id}`" class="text-xs text-brand-500 hover:text-brand-600 transition-colors">Edit</NuxtLink>
            </div>
          </li>
        </ul>
      </div>
    </template>

    <div v-else-if="error" class="card p-5 text-brand-700 text-sm">{{ $t('admin.failedDashboard') }}</div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const { adminFetch } = useAdminFetch()
const { data: stats, pending, error } = useAsyncData('stats', () => adminFetch('/api/dashboard/stats'))

useHead({ title: 'Dashboard — Admin' })
</script>
