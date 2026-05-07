<template>
  <div class="min-h-screen flex flex-col lg:flex-row bg-zinc-50">
    <!-- Desktop sidebar -->
    <aside class="hidden lg:flex w-56 shrink-0 flex-col bg-white border-r border-zinc-200 sticky top-0 h-screen overflow-y-auto">
      <div class="h-14 flex items-center px-5 border-b border-zinc-200 shrink-0 gap-2">
        <span class="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center text-[10px] font-black text-white shadow shadow-brand-500/30">J</span>
        <div class="min-w-0">
          <span class="font-bold text-zinc-900 tracking-tight text-sm block">Jam Cashier</span>
          <span v-if="storeName" class="text-[10px] text-zinc-400 truncate block">{{ storeName }}</span>
        </div>
      </div>

      <nav class="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <NuxtLink
          to="/cashier"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
          :class="$route.path === '/cashier' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {{ $t('cashier.nav.dashboard') }}
        </NuxtLink>

        <NuxtLink
          to="/cashier/orders"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
          :class="$route.path.startsWith('/cashier/orders') ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {{ $t('cashier.nav.orders') }}
        </NuxtLink>

        <NuxtLink
          to="/cashier/messages"
          class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
          :class="$route.path === '/cashier/messages' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
          </svg>
          {{ $t('cashier.nav.messages') }}
          <span v-if="msgUnread > 0" class="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">{{ msgUnread }}</span>
        </NuxtLink>

        <template v-if="canManageProducts">
          <p class="px-3 pt-4 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{{ $t('admin.sections.catalogue') }}</p>
          <NuxtLink
            to="/cashier/products"
            class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
            :class="$route.path.startsWith('/cashier/products') ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            {{ $t('cashier.nav.products') }}
          </NuxtLink>
        </template>

        <template v-if="canManageCategories">
          <NuxtLink
            v-if="!canManageProducts"
            to="/cashier/categories"
            class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
            :class="$route.path.startsWith('/cashier/categories') ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            {{ $t('cashier.nav.categories') }}
          </NuxtLink>
          <NuxtLink
            v-else
            to="/cashier/categories"
            class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
            :class="$route.path.startsWith('/cashier/categories') ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            {{ $t('cashier.nav.categories') }}
          </NuxtLink>
        </template>
      </nav>

      <div class="p-3 border-t border-zinc-200 shrink-0">
        <p class="text-xs text-zinc-400 px-3 pb-1 truncate">{{ adminStore.user?.name || adminStore.user?.email }}</p>
        <LangToggle class="w-full justify-start px-3" />
        <button
          class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-brand-50 hover:text-brand-600 rounded-xl transition-all duration-150"
          @click="adminStore.logout()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {{ $t('cashier.logout') }}
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0">
      <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-zinc-200 h-14 flex items-center px-4 lg:px-6 gap-3">
        <div class="lg:hidden flex items-center gap-2 mr-auto">
          <span class="w-5 h-5 rounded-md bg-brand-500 flex items-center justify-center text-[9px] font-black text-white">J</span>
          <span class="font-bold text-zinc-900 text-sm">{{ storeName || 'Cashier' }}</span>
        </div>
        <h1 class="hidden lg:block text-sm font-semibold text-zinc-500">{{ pageTitle }}</h1>
        <div class="lg:hidden ml-auto flex items-center gap-2">
          <LangToggle />
          <button
            class="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-brand-600 transition-colors"
            @click="adminStore.logout()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {{ $t('cashier.logout') }}
          </button>
        </div>
      </header>

      <main class="flex-1 p-4 lg:p-6 overflow-auto pb-24 lg:pb-6">
        <slot />
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <nav class="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-zinc-200">
      <div class="flex h-16">
        <NuxtLink to="/cashier" class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path === '/cashier' ? 'text-brand-500' : 'text-zinc-400'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="text-[9px] font-medium">{{ $t('cashier.dash') }}</span>
        </NuxtLink>
        <NuxtLink to="/cashier/orders" class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path.startsWith('/cashier/orders') ? 'text-brand-500' : 'text-zinc-400'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span class="text-[9px] font-medium">{{ $t('cashier.nav.orders') }}</span>
        </NuxtLink>
        <NuxtLink to="/cashier/messages" class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative" :class="$route.path === '/cashier/messages' ? 'text-brand-500' : 'text-zinc-400'">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
            </svg>
            <span v-if="msgUnread > 0" class="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">{{ msgUnread }}</span>
          </div>
          <span class="text-[9px] font-medium">{{ $t('cashier.nav.messages') }}</span>
        </NuxtLink>
        <NuxtLink v-if="canManageProducts" to="/cashier/products" class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path.startsWith('/cashier/products') ? 'text-brand-500' : 'text-zinc-400'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span class="text-[9px] font-medium">{{ $t('cashier.nav.products') }}</span>
        </NuxtLink>
        <NuxtLink v-if="canManageCategories" to="/cashier/categories" class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path.startsWith('/cashier/categories') ? 'text-brand-500' : 'text-zinc-400'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span class="text-[9px] font-medium">{{ $t('cashier.cats') }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup>
useHead({
  link: [{ key: 'manifest', rel: 'manifest', href: '/manifest-admin.webmanifest' }],
})

const { t } = useLocale()
const route = useRoute()
const adminStore = useAdminStore()
const { adminFetch } = useAdminFetch()
const { isSupported, subscribe } = usePushNotifications()

const permissions = computed(() => adminStore.user?.permissions ?? [])
const canManageProducts = computed(() =>
  permissions.value.includes('products:create') || permissions.value.includes('products:edit')
)
const canManageCategories = computed(() =>
  permissions.value.includes('categories:create') || permissions.value.includes('categories:edit')
)

const storeName = ref('')
onMounted(async () => {
  const storeId = adminStore.user?.storeId
  if (storeId) {
    try {
      const stores = await adminFetch('/api/admin/stores')
      storeName.value = stores.find(s => s.id === storeId)?.name ?? ''
    } catch {}
  }
  if (isSupported.value && adminStore.token) {
    subscribe(`Bearer ${adminStore.token}`)
  }
})

const pageTitle = computed(() => {
  if (route.path === '/cashier') return t('cashier.nav.dashboard')
  if (route.path.startsWith('/cashier/orders')) return t('cashier.nav.orders')
  if (route.path.startsWith('/cashier/products')) return t('cashier.nav.products')
  if (route.path.startsWith('/cashier/categories')) return t('cashier.nav.categories')
  return 'Cashier'
})
</script>
