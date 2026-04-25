<template>
  <div class="min-h-screen flex flex-col lg:flex-row bg-zinc-950">
    <!-- Desktop sidebar -->
    <aside class="hidden lg:flex w-60 shrink-0 flex-col bg-zinc-900 border-r border-zinc-800 sticky top-0 h-screen overflow-y-auto">
      <div class="h-14 flex items-center px-5 border-b border-zinc-800 shrink-0">
        <span class="font-bold text-brand-400 tracking-tight">Jam Admin</span>
      </div>

      <nav class="flex-1 p-3 space-y-0.5">
        <NuxtLink
          to="/admin"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors"
          :class="$route.path === '/admin' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </NuxtLink>

        <NuxtLink
          to="/admin/orders"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors"
          :class="$route.path.startsWith('/admin/orders') ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Orders
        </NuxtLink>

        <NuxtLink
          to="/admin/products"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors"
          :class="$route.path.startsWith('/admin/products') ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Products
        </NuxtLink>

        <NuxtLink
          to="/admin/categories"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors"
          :class="$route.path.startsWith('/admin/categories') ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Categories
        </NuxtLink>
      </nav>

      <div class="p-3 border-t border-zinc-800 shrink-0">
        <button
          class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
          @click="adminStore.logout()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>

    <!-- Main content area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top header -->
      <header class="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 h-14 flex items-center px-4 lg:px-6 gap-3">
        <span class="lg:hidden font-bold text-brand-400 text-sm mr-auto tracking-tight">Jam Admin</span>
        <h1 class="hidden lg:block text-sm font-semibold text-zinc-300">{{ pageTitle }}</h1>
        <button
          class="lg:hidden ml-auto flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-red-400 transition-colors"
          @click="adminStore.logout()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </header>

      <!-- Page content — bottom padding for mobile nav -->
      <main class="flex-1 p-4 lg:p-6 overflow-auto pb-24 lg:pb-6">
        <slot />
      </main>
    </div>

    <!-- Mobile bottom navigation -->
    <nav class="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800">
      <div class="grid grid-cols-4 h-16">
        <NuxtLink
          to="/admin"
          class="flex flex-col items-center justify-center gap-0.5 transition-colors"
          :class="$route.path === '/admin' ? 'text-brand-400' : 'text-zinc-500'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="text-[10px] font-medium">Dash</span>
        </NuxtLink>

        <NuxtLink
          to="/admin/orders"
          class="flex flex-col items-center justify-center gap-0.5 transition-colors"
          :class="$route.path.startsWith('/admin/orders') ? 'text-brand-400' : 'text-zinc-500'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span class="text-[10px] font-medium">Orders</span>
        </NuxtLink>

        <NuxtLink
          to="/admin/products"
          class="flex flex-col items-center justify-center gap-0.5 transition-colors"
          :class="$route.path.startsWith('/admin/products') ? 'text-brand-400' : 'text-zinc-500'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span class="text-[10px] font-medium">Products</span>
        </NuxtLink>

        <NuxtLink
          to="/admin/categories"
          class="flex flex-col items-center justify-center gap-0.5 transition-colors"
          :class="$route.path.startsWith('/admin/categories') ? 'text-brand-400' : 'text-zinc-500'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span class="text-[10px] font-medium">Cats</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup>
const route = useRoute()
const adminStore = useAdminStore()

const pageTitle = computed(() => {
  if (route.path === '/admin') return 'Dashboard'
  if (route.path.startsWith('/admin/orders')) return 'Orders'
  if (route.path.startsWith('/admin/products')) return 'Products'
  if (route.path.startsWith('/admin/categories')) return 'Categories'
  return 'Admin'
})
</script>
