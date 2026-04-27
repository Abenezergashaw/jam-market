<template>
  <div class="min-h-screen flex flex-col lg:flex-row bg-zinc-50">
    <!-- Desktop sidebar -->
    <aside class="hidden lg:flex w-56 shrink-0 flex-col bg-white border-r border-zinc-200 sticky top-0 h-screen overflow-y-auto">
      <div class="h-14 flex items-center px-5 border-b border-zinc-200 shrink-0 gap-2">
        <span class="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center text-[10px] font-black text-white shadow shadow-brand-500/30">J</span>
        <span class="font-bold text-zinc-900 tracking-tight text-sm">Jam Admin</span>
      </div>

      <nav class="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <NuxtLink
          to="/admin"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
          :class="$route.path === '/admin' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </NuxtLink>

        <NuxtLink
          to="/admin/orders"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
          :class="$route.path.startsWith('/admin/orders') ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Orders
        </NuxtLink>

        <p class="px-3 pt-4 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Catalogue</p>

        <NuxtLink
          to="/admin/products"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
          :class="$route.path === '/admin/products' || ($route.path.startsWith('/admin/products/') && !$route.path.includes('low-stock')) ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Products
        </NuxtLink>

        <NuxtLink
          to="/admin/products/low-stock"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
          :class="$route.path === '/admin/products/low-stock' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Low Stock
        </NuxtLink>

        <NuxtLink
          to="/admin/categories"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
          :class="$route.path.startsWith('/admin/categories') ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Categories
        </NuxtLink>

        <p class="px-3 pt-4 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Storefront</p>

        <NuxtLink
          to="/admin/settings"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
          :class="$route.path === '/admin/settings' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </NuxtLink>

        <NuxtLink
          to="/admin/hero"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
          :class="$route.path.startsWith('/admin/hero') ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Hero Slides
        </NuxtLink>

        <p class="px-3 pt-4 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Quick Add</p>

        <NuxtLink to="/admin/products/new" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </NuxtLink>

        <NuxtLink to="/admin/categories/new" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </NuxtLink>
      </nav>

      <div class="p-3 border-t border-zinc-200 shrink-0">
        <button
          class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-brand-50 hover:text-brand-600 rounded-xl transition-all duration-150"
          @click="adminStore.logout()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0">
      <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-zinc-200 h-14 flex items-center px-4 lg:px-6 gap-3">
        <div class="lg:hidden flex items-center gap-2 mr-auto">
          <span class="w-5 h-5 rounded-md bg-brand-500 flex items-center justify-center text-[9px] font-black text-white">J</span>
          <span class="font-bold text-zinc-900 text-sm">Jam Admin</span>
        </div>
        <h1 class="hidden lg:block text-sm font-semibold text-zinc-500">{{ pageTitle }}</h1>
        <button
          class="lg:hidden ml-auto flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-brand-600 transition-colors"
          @click="adminStore.logout()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </header>

      <main class="flex-1 p-4 lg:p-6 overflow-auto pb-24 lg:pb-6">
        <slot />
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <nav class="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-zinc-200">
      <div class="grid grid-cols-6 h-16">
        <NuxtLink to="/admin" class="flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path === '/admin' ? 'text-brand-500' : 'text-zinc-400'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="text-[9px] font-medium">Dash</span>
        </NuxtLink>

        <NuxtLink to="/admin/orders" class="flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path.startsWith('/admin/orders') ? 'text-brand-500' : 'text-zinc-400'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span class="text-[9px] font-medium">Orders</span>
        </NuxtLink>

        <NuxtLink to="/admin/products" class="flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path.startsWith('/admin/products') && !$route.path.includes('low-stock') ? 'text-brand-500' : 'text-zinc-400'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span class="text-[9px] font-medium">Products</span>
        </NuxtLink>

        <NuxtLink to="/admin/products/low-stock" class="flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path === '/admin/products/low-stock' ? 'text-amber-500' : 'text-zinc-400'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="text-[9px] font-medium">Stock</span>
        </NuxtLink>

        <NuxtLink to="/admin/categories" class="flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path.startsWith('/admin/categories') ? 'text-brand-500' : 'text-zinc-400'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span class="text-[9px] font-medium">Cats</span>
        </NuxtLink>

        <NuxtLink to="/admin/settings" class="flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path === '/admin/settings' ? 'text-brand-500' : 'text-zinc-400'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="text-[9px] font-medium">Settings</span>
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
  if (route.path === '/admin/products/low-stock') return 'Low Stock'
  if (route.path.startsWith('/admin/orders')) return 'Orders'
  if (route.path.startsWith('/admin/products')) return 'Products'
  if (route.path.startsWith('/admin/categories')) return 'Categories'
  if (route.path.startsWith('/admin/hero')) return 'Hero Slides'
  if (route.path === '/admin/settings') return 'Settings'
  return 'Admin'
})
</script>
