<template>
  <div class="min-h-screen flex flex-col bg-zinc-50">
    <!-- Top nav -->
    <header class="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center px-4 gap-3 shrink-0">
      <span class="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-[11px] font-black text-white shadow shadow-brand-500/30 shrink-0">J</span>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-bold text-zinc-900 leading-tight">Jam Delivery</p>
        <p v-if="storeName" class="text-[10px] text-zinc-400 leading-tight truncate">{{ storeName }}</p>
      </div>
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/delivery/orders"
          class="text-xs font-medium transition-colors"
          :class="$route.path.startsWith('/delivery') ? 'text-brand-600' : 'text-zinc-500 hover:text-zinc-900'"
        >
          My Orders
        </NuxtLink>
        <button
          class="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-brand-600 transition-colors"
          @click="adminStore.logout()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </header>

    <main class="flex-1 p-4 lg:p-6 overflow-auto">
      <slot />
    </main>
  </div>
</template>

<script setup>
const adminStore = useAdminStore()
const { adminFetch } = useAdminFetch()

const storeName = ref('')
onMounted(async () => {
  const storeId = adminStore.user?.storeId
  if (storeId) {
    try {
      const store = await adminFetch('/api/delivery/store')
      storeName.value = store?.name ?? ''
    } catch {}
  }
})
</script>
