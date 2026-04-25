<template>
  <div class="min-h-screen flex flex-col bg-zinc-950">
    <!-- Top header -->
    <header class="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <NuxtLink to="/" class="text-lg font-bold text-brand-400 shrink-0 tracking-tight">
          Jam Store
        </NuxtLink>

        <!-- Desktop nav -->
        <div class="hidden sm:flex items-center gap-1">
          <NuxtLink
            v-if="myOrdersStore.orders.length > 0"
            to="/orders"
            class="flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-brand-400 transition-colors px-3 py-2 rounded-xl hover:bg-zinc-800/60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Orders
          </NuxtLink>

          <NuxtLink
            to="/cart"
            class="relative flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-brand-400 transition-colors px-3 py-2 rounded-xl hover:bg-zinc-800/60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 6.53A1 1 0 007.63 21h8.74a1 1 0 00.98-1.22L16 13M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            Cart
            <span
              v-if="cartStore.totalItems > 0"
              class="absolute -top-0.5 right-0 bg-brand-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1"
            >
              {{ cartStore.totalItems }}
            </span>
          </NuxtLink>
        </div>

        <!-- Mobile: cart icon only -->
        <NuxtLink to="/cart" class="sm:hidden relative p-2 text-zinc-400 hover:text-brand-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 6.53A1 1 0 007.63 21h8.74a1 1 0 00.98-1.22L16 13M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
          <span
            v-if="cartStore.totalItems > 0"
            class="absolute top-1 right-1 bg-brand-500 text-white text-[10px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center"
          >
            {{ cartStore.totalItems }}
          </span>
        </NuxtLink>
      </div>
    </header>

    <!-- Page content — bottom padding on mobile for the fixed nav -->
    <main class="flex-1 pb-20 sm:pb-0">
      <slot />
    </main>

    <!-- Desktop footer -->
    <footer class="hidden sm:block bg-zinc-900/30 border-t border-zinc-800/60 mt-12">
      <div class="max-w-6xl mx-auto px-4 py-5 text-center text-sm text-zinc-600">
        &copy; {{ new Date().getFullYear() }} Jam Store — Fresh groceries delivered fast
      </div>
    </footer>

    <!-- Mobile bottom navigation -->
    <nav class="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800">
      <div class="grid grid-cols-3 h-16">
        <NuxtLink
          to="/"
          class="flex flex-col items-center justify-center gap-1 transition-colors"
          :class="$route.path === '/' || $route.path.startsWith('/category') ? 'text-brand-400' : 'text-zinc-500'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="text-[10px] font-medium">Home</span>
        </NuxtLink>

        <NuxtLink
          to="/orders"
          class="flex flex-col items-center justify-center gap-1 transition-colors"
          :class="$route.path === '/orders' ? 'text-brand-400' : 'text-zinc-500'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span class="text-[10px] font-medium">Orders</span>
        </NuxtLink>

        <NuxtLink
          to="/cart"
          class="flex flex-col items-center justify-center gap-1 transition-colors"
          :class="$route.path === '/cart' ? 'text-brand-400' : 'text-zinc-500'"
        >
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 6.53A1 1 0 007.63 21h8.74a1 1 0 00.98-1.22L16 13M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            <span
              v-if="cartStore.totalItems > 0"
              class="absolute -top-1.5 -right-1.5 bg-brand-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center"
            >
              {{ cartStore.totalItems }}
            </span>
          </div>
          <span class="text-[10px] font-medium">Cart</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup>
const cartStore = useCartStore()
const myOrdersStore = useCustomerOrdersStore()
</script>
