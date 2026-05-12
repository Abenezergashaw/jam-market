<template>
  <div class="min-h-screen flex flex-col lg:flex-row bg-zinc-50">

    <!-- ─── Desktop sidebar ──────────────────────────────── -->
    <aside class="hidden lg:flex w-56 shrink-0 flex-col bg-white border-r border-zinc-200 sticky top-0 h-screen overflow-y-auto">
      <div class="h-14 flex items-center px-5 border-b border-zinc-200 shrink-0 gap-2">
        <img src="/logo.svg" alt="Jam" class="h-7 w-auto" onerror="this.src='/logo.jpg'" />
        <span class="font-bold text-zinc-900 tracking-tight text-sm">{{ $t('admin.jamAdmin') }}</span>
      </div>

      <nav class="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <NuxtLink to="/admin" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          {{ $t('admin.nav.dashboard') }}
        </NuxtLink>
        <NuxtLink to="/admin/orders" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path.startsWith('/admin/orders') ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          {{ $t('admin.nav.orders') }}
          <span v-if="pendingCount > 0" class="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">{{ pendingCount }}</span>
        </NuxtLink>
        <NuxtLink to="/admin/messages" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin/messages' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" /></svg>
          {{ $t('admin.nav.messages') }}
          <span v-if="msgUnread > 0" class="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">{{ msgUnread }}</span>
        </NuxtLink>
        <NuxtLink to="/admin/special-orders" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin/special-orders' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
          Product Requests
          <span v-if="specialOrderCount > 0" class="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">{{ specialOrderCount }}</span>
        </NuxtLink>
        <NuxtLink to="/admin/revenue" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin/revenue' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          {{ $t('admin.nav.revenue') }}
        </NuxtLink>

        <p class="px-3 pt-4 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{{ $t('admin.sections.delivery') }}</p>
        <NuxtLink to="/admin/delivery/live" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin/delivery/live' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          {{ $t('admin.nav.liveMap') }}
        </NuxtLink>

        <p class="px-3 pt-4 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{{ $t('admin.sections.catalogue') }}</p>
        <NuxtLink to="/admin/products" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin/products' || ($route.path.startsWith('/admin/products/') && !$route.path.includes('low-stock')) ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          {{ $t('admin.nav.products') }}
        </NuxtLink>
        <NuxtLink to="/admin/products/low-stock" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin/products/low-stock' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {{ $t('admin.nav.lowStock') }}
        </NuxtLink>
        <NuxtLink to="/admin/categories" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path.startsWith('/admin/categories') ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          {{ $t('admin.nav.categories') }}
        </NuxtLink>

        <p class="px-3 pt-4 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{{ $t('admin.sections.storefront') }}</p>
        <NuxtLink to="/admin/stores" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path.startsWith('/admin/stores') ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          {{ $t('admin.nav.stores') }}
        </NuxtLink>
        <NuxtLink to="/admin/settings" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin/settings' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          {{ $t('admin.nav.settings') }}
        </NuxtLink>
        <NuxtLink to="/admin/hero" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path.startsWith('/admin/hero') ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {{ $t('admin.nav.heroSlides') }}
        </NuxtLink>

        <NuxtLink to="/admin/customers" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin/customers' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Customers
        </NuxtLink>

        <template v-if="adminStore.user?.role === 'admin'">
          <p class="px-3 pt-4 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{{ $t('admin.sections.team') }}</p>
          <NuxtLink to="/admin/users" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path.startsWith('/admin/users') ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            {{ $t('admin.nav.users') }}
          </NuxtLink>
          <NuxtLink to="/admin/audit" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin/audit' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            {{ $t('admin.nav.auditLog') }}
          </NuxtLink>
        </template>

        <p class="px-3 pt-4 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{{ $t('admin.sections.quickAdd') }}</p>
        <NuxtLink to="/admin/products/new" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
          {{ $t('admin.nav.addProduct') }}
        </NuxtLink>
        <NuxtLink to="/admin/products/import" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          {{ $t('admin.nav.importProducts') }}
        </NuxtLink>
        <NuxtLink to="/admin/categories/new" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
          {{ $t('admin.nav.addCategory') }}
        </NuxtLink>
      </nav>

      <!-- Desktop user + logout -->
      <div class="p-3 border-t border-zinc-200 shrink-0 space-y-1">
        <div class="flex items-center gap-2.5 px-3 py-2">
          <div :class="['w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shrink-0', avatarBg]">{{ initials }}</div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-zinc-800 truncate">{{ adminStore.user?.name || adminStore.user?.email }}</p>
            <p class="text-[10px] text-zinc-400 truncate">{{ adminStore.user?.email }}</p>
          </div>
        </div>
        <LangToggle class="w-full justify-start px-3" />
        <button class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-150" @click="adminStore.logout()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          {{ $t('admin.logout') }}
        </button>
      </div>
    </aside>

    <!-- ─── Mobile drawer backdrop ───────────────────────── -->
    <Transition name="backdrop">
      <div v-if="drawerOpen" class="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" @click="drawerOpen = false" />
    </Transition>

    <!-- ─── Mobile drawer ─────────────────────────────────── -->
    <Transition name="drawer">
      <div v-if="drawerOpen" class="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-white flex flex-col shadow-2xl shadow-black/20">

        <!-- Drawer top bar -->
        <div class="h-14 flex items-center gap-3 px-4 border-b border-zinc-100 shrink-0">
          <button class="p-1.5 -ml-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors" @click="drawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img src="/logo.svg" alt="Jam" class="h-6 w-auto" onerror="this.src='/logo.jpg'" />
          <span class="font-bold text-zinc-900 text-sm">{{ $t('admin.jamAdmin') }}</span>
        </div>

        <!-- User profile card -->
        <div class="px-4 pt-4 pb-3 border-b border-zinc-100 shrink-0">
          <div class="flex items-center gap-3">
            <div :class="['w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm', avatarBg]">
              {{ initials }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-zinc-900 truncate leading-tight">{{ adminStore.user?.name || '—' }}</p>
              <p class="text-xs text-zinc-400 truncate mt-0.5">{{ adminStore.user?.email }}</p>
            </div>
          </div>
          <div class="mt-3">
            <span :class="['inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ring-1', roleBadgeClass]">
              {{ roleLabel }}
            </span>
          </div>
        </div>

        <!-- Drawer nav -->
        <nav class="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <NuxtLink to="/admin" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'" @click="drawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            {{ $t('admin.nav.dashboard') }}
          </NuxtLink>
          <NuxtLink to="/admin/orders" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path.startsWith('/admin/orders') ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'" @click="drawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            {{ $t('admin.nav.orders') }}
            <span v-if="pendingCount > 0" class="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">{{ pendingCount }}</span>
          </NuxtLink>
          <NuxtLink to="/admin/messages" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin/messages' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'" @click="drawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" /></svg>
            {{ $t('admin.nav.messages') }}
            <span v-if="msgUnread > 0" class="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">{{ msgUnread }}</span>
          </NuxtLink>
          <NuxtLink to="/admin/special-orders" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin/special-orders' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'" @click="drawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
            Product Requests
            <span v-if="specialOrderCount > 0" class="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">{{ specialOrderCount }}</span>
          </NuxtLink>
          <NuxtLink to="/admin/revenue" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin/revenue' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'" @click="drawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            {{ $t('admin.nav.revenue') }}
          </NuxtLink>

          <p class="px-3 pt-4 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{{ $t('admin.sections.delivery') }}</p>
          <NuxtLink to="/admin/delivery/live" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin/delivery/live' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'" @click="drawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {{ $t('admin.nav.liveMap') }}
          </NuxtLink>

          <p class="px-3 pt-4 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{{ $t('admin.sections.catalogue') }}</p>
          <NuxtLink to="/admin/products" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin/products' || ($route.path.startsWith('/admin/products/') && !$route.path.includes('low-stock')) ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'" @click="drawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            {{ $t('admin.nav.products') }}
          </NuxtLink>
          <NuxtLink to="/admin/products/low-stock" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin/products/low-stock' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'" @click="drawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {{ $t('admin.nav.lowStock') }}
          </NuxtLink>
          <NuxtLink to="/admin/categories" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path.startsWith('/admin/categories') ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'" @click="drawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            {{ $t('admin.nav.categories') }}
          </NuxtLink>

          <p class="px-3 pt-4 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{{ $t('admin.sections.storefront') }}</p>
          <NuxtLink to="/admin/stores" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path.startsWith('/admin/stores') ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'" @click="drawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {{ $t('admin.nav.stores') }}
          </NuxtLink>
          <NuxtLink to="/admin/settings" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin/settings' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'" @click="drawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {{ $t('admin.nav.settings') }}
          </NuxtLink>
          <NuxtLink to="/admin/hero" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path.startsWith('/admin/hero') ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'" @click="drawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {{ $t('admin.nav.heroSlides') }}
          </NuxtLink>
          <NuxtLink to="/admin/customers" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin/customers' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'" @click="drawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Customers
          </NuxtLink>

          <template v-if="adminStore.user?.role === 'admin'">
            <p class="px-3 pt-4 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{{ $t('admin.sections.team') }}</p>
            <NuxtLink to="/admin/users" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path.startsWith('/admin/users') ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'" @click="drawerOpen = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              {{ $t('admin.nav.users') }}
            </NuxtLink>
            <NuxtLink to="/admin/audit" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150" :class="$route.path === '/admin/audit' ? 'bg-brand-500/10 text-brand-600 border border-brand-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'" @click="drawerOpen = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              {{ $t('admin.nav.auditLog') }}
            </NuxtLink>
          </template>

          <p class="px-3 pt-4 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{{ $t('admin.sections.quickAdd') }}</p>
          <NuxtLink to="/admin/products/new" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50" @click="drawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
            {{ $t('admin.nav.addProduct') }}
          </NuxtLink>
          <NuxtLink to="/admin/products/import" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50" @click="drawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            {{ $t('admin.nav.importProducts') }}
          </NuxtLink>
          <NuxtLink to="/admin/categories/new" class="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50" @click="drawerOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
            {{ $t('admin.nav.addCategory') }}
          </NuxtLink>
        </nav>

        <!-- Drawer logout -->
        <div class="p-3 border-t border-zinc-100 shrink-0 space-y-1">
          <LangToggle class="w-full justify-start px-3" />
          <button class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-150" @click="adminStore.logout()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {{ $t('admin.logout') }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- ─── Main content ───────────────────────────────────── -->
    <div class="flex-1 flex flex-col min-w-0">

      <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-zinc-200 h-14 flex items-center px-4 lg:px-6 gap-3">
        <!-- Mobile: hamburger -->
        <button
          class="lg:hidden p-1.5 -ml-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          @click="drawerOpen = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Mobile: page title -->
        <span class="lg:hidden text-sm font-semibold text-zinc-800">{{ pageTitle }}</span>

        <!-- Desktop: page title -->
        <h1 class="hidden lg:block text-sm font-semibold text-zinc-500">{{ pageTitle }}</h1>

        <div class="ml-auto">
          <LangToggle />
        </div>
      </header>

      <main class="flex-1 p-4 lg:p-6 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
useHead({
  link: [{ key: 'manifest', rel: 'manifest', href: '/manifest-admin.webmanifest' }],
})

const { t } = useLocale()
const route = useRoute()
const adminStore = useAdminStore()
const { pendingCount, acknowledge } = useOrderNotifier()
const { unreadCount: msgUnread, acknowledge: ackMessages } = useAdminMessageNotifier()
const { isSupported, subscribe } = usePushNotifications()
const { adminFetch } = useAdminFetch()

const specialOrderCount = ref(0)
async function fetchSpecialOrderCount() {
  try {
    const { count } = await adminFetch('/api/admin/special-orders/pending-count')
    specialOrderCount.value = count
  } catch {}
}

onMounted(() => {
  if (isSupported.value && adminStore.token) {
    subscribe(`Bearer ${adminStore.token}`)
  }
  fetchSpecialOrderCount()
  setInterval(fetchSpecialOrderCount, 30_000)
})

const drawerOpen = ref(false)

watch(() => route.path, (path) => {
  drawerOpen.value = false
  if (path.startsWith('/admin/orders')) acknowledge()
  if (path === '/admin/messages') ackMessages()
})

const initials = computed(() => {
  const name = adminStore.user?.name?.trim()
  if (name) {
    const parts = name.split(' ').filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (adminStore.user?.email ?? '??').slice(0, 2).toUpperCase()
})

const avatarBg = computed(() => {
  const r = adminStore.user?.role
  if (r === 'admin') return 'bg-brand-500'
  if (r === 'cashier') return 'bg-blue-500'
  if (r === 'delivery') return 'bg-emerald-500'
  if (r === 'manager') return 'bg-purple-500'
  return 'bg-zinc-500'
})

const roleBadgeClass = computed(() => {
  const r = adminStore.user?.role
  if (r === 'admin') return 'bg-brand-50 text-brand-700 ring-brand-200'
  if (r === 'cashier') return 'bg-blue-50 text-blue-700 ring-blue-200'
  if (r === 'delivery') return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (r === 'manager') return 'bg-purple-50 text-purple-700 ring-purple-200'
  return 'bg-zinc-100 text-zinc-600 ring-zinc-200'
})

const roleLabel = computed(() => {
  const r = adminStore.user?.role
  const labels = {
    admin: t('admin.roles.administrator'),
    cashier: t('admin.roles.cashier'),
    delivery: t('admin.roles.delivery'),
    manager: t('admin.roles.manager'),
  }
  return labels[r] ?? (r ? r.charAt(0).toUpperCase() + r.slice(1) : t('admin.roles.staff'))
})

const pageTitle = computed(() => {
  if (route.path === '/admin') return t('admin.pageTitle.dashboard')
  if (route.path === '/admin/products/low-stock') return t('admin.pageTitle.lowStock')
  if (route.path.startsWith('/admin/orders')) return t('admin.pageTitle.orders')
  if (route.path === '/admin/revenue') return t('admin.pageTitle.revenue')
  if (route.path === '/admin/products/import') return t('admin.pageTitle.importProducts')
  if (route.path.startsWith('/admin/products')) return t('admin.pageTitle.products')
  if (route.path.startsWith('/admin/categories')) return t('admin.pageTitle.categories')
  if (route.path.startsWith('/admin/hero')) return t('admin.pageTitle.heroSlides')
  if (route.path === '/admin/settings') return t('admin.pageTitle.settings')
  if (route.path.startsWith('/admin/stores')) return t('admin.pageTitle.stores')
  if (route.path.startsWith('/admin/users')) return t('admin.pageTitle.users')
  if (route.path === '/admin/messages') return t('admin.pageTitle.messages')
  if (route.path === '/admin/customers') return 'Customers'
  if (route.path === '/admin/special-orders') return 'Product Requests'
  return t('admin.jamAdmin')
})
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(-100%);
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
</style>
