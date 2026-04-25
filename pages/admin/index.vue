<template>
  <div class="space-y-6">
    <!-- Stats grid -->
    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div v-for="n in 3" :key="n" class="card h-28 animate-pulse bg-zinc-800" />
    </div>

    <div v-else-if="stats" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- Total orders -->
      <div class="card p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Orders</p>
            <p class="text-3xl font-bold text-zinc-50 mt-2">{{ stats?.totalOrders }}</p>
          </div>
          <div class="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Pending orders -->
      <div class="card p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pending</p>
            <p class="text-3xl font-bold text-zinc-50 mt-2">{{ stats?.pendingOrders }}</p>
            <p class="text-xs text-zinc-500 mt-1">Awaiting confirmation</p>
          </div>
          <div class="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Revenue -->
      <div class="card p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Revenue</p>
            <p class="text-3xl font-bold text-zinc-50 mt-2">${{ Number(stats?.revenue ?? 0).toFixed(2) }}</p>
            <p class="text-xs text-zinc-500 mt-1">From confirmed orders</p>
          </div>
          <div class="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="card p-5 text-red-400 text-sm">Failed to load stats. Check your connection.</div>

    <!-- Low stock alert -->
    <div v-if="stats?.lowStockProducts?.length" class="card p-5">
      <h2 class="font-semibold text-zinc-100 mb-3 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        Low Stock Alert
        <span class="badge badge-yellow ml-auto">{{ stats.lowStockProducts.length }}</span>
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

    <!-- Quick actions -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <NuxtLink to="/admin/orders" class="card p-5 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all flex items-center gap-3.5">
        <div class="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-400 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-zinc-200">View Orders</p>
          <p class="text-xs text-zinc-500">Manage customer orders</p>
        </div>
      </NuxtLink>

      <NuxtLink to="/admin/products/new" class="card p-5 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all flex items-center gap-3.5">
        <div class="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-zinc-200">Add Product</p>
          <p class="text-xs text-zinc-500">Create a new product</p>
        </div>
      </NuxtLink>

      <NuxtLink to="/admin/categories/new" class="card p-5 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all flex items-center gap-3.5">
        <div class="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-zinc-200">Add Category</p>
          <p class="text-xs text-zinc-500">Create a new category</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const { adminFetch } = useAdminFetch()
const { data: stats, pending, error } = useAsyncData('stats', () => adminFetch('/api/dashboard/stats'))

useHead({ title: 'Dashboard — Admin' })
</script>
