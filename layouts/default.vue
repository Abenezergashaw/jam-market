<template>
  <div class="min-h-screen flex flex-col bg-[#f8f5f0]">
    <!-- Header -->
    <header
      class="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-zinc-200/80 shadow-sm"
    >
      <div
        class="max-w-6xl mx-auto px-4 flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-2 py-2 sm:py-0 sm:h-14"
      >
        <NuxtLink
          to="/"
          class="order-1 shrink-0 flex flex-col items-start leading-none"
        >
          <span
            class="text-xl font-black text-forest-500 tracking-tight leading-none"
            >JAM</span
          >
          <span
            class="text-[8px] font-bold text-zinc-400 tracking-[0.18em] uppercase leading-none mt-0.5"
            >Supermarket</span
          >
        </NuxtLink>

        <SearchBar
          class="order-3 sm:order-2 w-full sm:w-auto sm:flex-1 sm:max-w-sm"
        />

        <!-- Desktop nav -->
        <div
          class="order-4 sm:order-3 hidden sm:flex items-center gap-1 shrink-0"
        >
          <NuxtLink
            v-if="myOrdersStore.orders.length > 0"
            to="/orders"
            class="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-2 rounded-xl hover:bg-zinc-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            My Orders
          </NuxtLink>

          <NuxtLink
            v-if="customerStore.isAuthenticated"
            to="/messages"
            class="relative flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-2 rounded-xl hover:bg-zinc-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
            </svg>
            Messages
            <span v-if="msgUnread > 0" class="absolute -top-0.5 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 shadow shadow-red-500/30">{{ msgUnread }}</span>
          </NuxtLink>

          <!-- Account / Login -->
          <template v-if="customerStore.isAuthenticated">
            <div
              class="flex items-center gap-1 pl-1 border-l border-zinc-200 ml-1"
            >
              <NuxtLink
                to="/account"
                class="flex items-center gap-1.5 px-1.5 py-1 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <img
                  v-if="customerStore.user?.photoUrl"
                  :src="customerStore.user.photoUrl"
                  class="w-6 h-6 rounded-full object-cover shrink-0"
                  :alt="customerStore.fullName"
                />
                <span
                  v-else
                  class="w-6 h-6 rounded-full bg-forest-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                >
                  {{ customerStore.user?.firstName?.[0] ?? "?" }}
                </span>
                <span class="text-sm font-medium text-zinc-700">{{
                  customerStore.user?.firstName
                }}</span>
              </NuxtLink>
              <button
                class="text-xs font-semibold text-zinc-400 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
                @click="customerStore.logout()"
              >
                Sign out
              </button>
            </div>
          </template>
          <template v-else>
            <NuxtLink
              to="/login"
              class="flex items-center gap-1.5 text-sm font-semibold text-forest-600 hover:text-forest-700 transition-colors px-3 py-2 rounded-xl hover:bg-forest-50 border border-forest-200"
            >
              Sign in
            </NuxtLink>
          </template>

          <NuxtLink
            to="/cart"
            class="relative flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-2 rounded-xl hover:bg-zinc-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 6.53A1 1 0 007.63 21h8.74a1 1 0 00.98-1.22L16 13M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z"
              />
            </svg>
            Cart
            <span
              v-if="cartStore.totalItems > 0"
              class="absolute -top-0.5 right-0 bg-forest-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 shadow shadow-forest-500/30"
            >
              {{ cartStore.totalItems }}
            </span>
          </NuxtLink>
        </div>

        <!-- Mobile: cart icon -->
        <NuxtLink
          to="/cart"
          class="order-2 ml-auto sm:hidden relative p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 6.53A1 1 0 007.63 21h8.74a1 1 0 00.98-1.22L16 13M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z"
            />
          </svg>
          <span
            v-if="cartStore.totalItems > 0"
            class="absolute top-1 right-1 bg-forest-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow shadow-forest-500/30"
          >
            {{ cartStore.totalItems }}
          </span>
        </NuxtLink>
      </div>
    </header>

    <main class="flex-1 pb-20 sm:pb-0">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="hidden sm:block border-t border-zinc-200 mt-12">
      <div
        class="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between gap-4"
      >
        <div class="flex items-center gap-2">
          <span
            class="w-5 h-5 rounded-md bg-forest-500 flex items-center justify-center text-[9px] font-black text-white"
            >J</span
          >
          <span class="text-sm font-semibold text-zinc-800">Jam Store</span>
        </div>
        <p class="text-xs text-zinc-400">
          &copy; {{ new Date().getFullYear() }} Jam Store — Fresh groceries
          delivered fast
        </p>
      </div>
    </footer>

    <!-- Mobile account sheet -->
    <Transition name="sheet">
      <div
        v-if="mobileAccountOpen"
        class="sm:hidden fixed inset-0 z-50 flex flex-col justify-end"
        @click.self="mobileAccountOpen = false"
      >
        <div
          class="absolute inset-0 bg-black/30"
          @click="mobileAccountOpen = false"
        />
        <div
          class="relative bg-white rounded-t-2xl px-5 pt-5 pb-10 space-y-4 shadow-xl"
        >
          <div class="w-10 h-1 rounded-full bg-zinc-200 mx-auto mb-2" />
          <div class="flex items-center gap-3">
            <img
              v-if="customerStore.user?.photoUrl"
              :src="customerStore.user.photoUrl"
              class="w-12 h-12 rounded-full object-cover"
            />
            <div
              v-else
              class="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center text-lg font-bold text-forest-600"
            >
              {{ customerStore.user?.firstName?.[0] ?? "?" }}
            </div>
            <div>
              <p class="font-bold text-zinc-900">
                {{ customerStore.fullName }}
              </p>
              <p
                v-if="customerStore.user?.username"
                class="text-sm text-zinc-400"
              >
                @{{ customerStore.user.username }}
              </p>
            </div>
          </div>
          <NuxtLink
            to="/account"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 transition-colors"
            @click="mobileAccountOpen = false"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span class="text-sm font-medium text-zinc-700">My Account</span>
          </NuxtLink>
          <NuxtLink
            to="/orders"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 transition-colors"
            @click="mobileAccountOpen = false"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span class="text-sm font-medium text-zinc-700">My Orders</span>
          </NuxtLink>
          <NuxtLink
            to="/messages"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 transition-colors"
            @click="mobileAccountOpen = false"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
            </svg>
            <span class="text-sm font-medium text-zinc-700">Messages</span>
            <span v-if="msgUnread > 0" class="ml-auto min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">{{ msgUnread }}</span>
          </NuxtLink>
          <button
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-left"
            @click="
              customerStore.logout();
              mobileAccountOpen = false;
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span class="text-sm font-medium text-red-500">Sign out</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Mobile bottom nav -->
    <nav
      class="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-zinc-200"
    >
      <div
        class="grid h-16"
        :class="customerStore.isAuthenticated ? 'grid-cols-6' : 'grid-cols-4'"
      >
        <NuxtLink
          to="/"
          class="flex flex-col items-center justify-center gap-1 transition-colors"
          :class="
            $route.path === '/' || $route.path.startsWith('/category')
              ? 'text-forest-500'
              : 'text-zinc-400'
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span class="text-[10px] font-medium">Home</span>
        </NuxtLink>

        <NuxtLink
          to="/search"
          class="flex flex-col items-center justify-center gap-1 transition-colors"
          :class="
            $route.path === '/search' ? 'text-forest-500' : 'text-zinc-400'
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"
            />
          </svg>
          <span class="text-[10px] font-medium">Search</span>
        </NuxtLink>

        <NuxtLink
          to="/orders"
          v-if="customerStore.isAuthenticated"
          class="flex flex-col items-center justify-center gap-1 transition-colors"
          :class="
            $route.path === '/orders' ? 'text-forest-500' : 'text-zinc-400'
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span class="text-[10px] font-medium">Orders</span>
        </NuxtLink>

        <!-- Account / Login -->
        <button
          v-if="customerStore.isAuthenticated"
          class="flex flex-col items-center justify-center gap-1 transition-colors text-forest-500"
          @click="mobileAccountOpen = true"
        >
          <img
            v-if="customerStore.user?.photoUrl"
            :src="customerStore.user.photoUrl"
            class="w-5 h-5 rounded-full object-cover ring-2 ring-forest-400"
            :alt="customerStore.fullName"
          />
          <span
            v-else
            class="w-5 h-5 rounded-full bg-forest-500 flex items-center justify-center text-[9px] font-bold text-white"
          >
            {{ customerStore.user?.firstName?.[0] ?? "?" }}
          </span>
          <span class="text-[10px] font-medium">{{
            customerStore.user?.firstName
          }}</span>
        </button>
        <NuxtLink
          v-else
          to="/login"
          class="flex flex-col items-center justify-center gap-1 transition-colors"
          :class="
            $route.path === '/login' ? 'text-forest-500' : 'text-zinc-400'
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span class="text-[10px] font-medium">Sign in</span>
        </NuxtLink>

        <NuxtLink
          v-if="customerStore.isAuthenticated"
          to="/messages"
          class="flex flex-col items-center justify-center gap-1 transition-colors"
          :class="$route.path === '/messages' ? 'text-forest-500' : 'text-zinc-400'"
        >
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
            </svg>
            <span v-if="msgUnread > 0" class="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">{{ msgUnread }}</span>
          </div>
          <span class="text-[10px] font-medium">Messages</span>
        </NuxtLink>

        <NuxtLink
          to="/cart"
          class="flex flex-col items-center justify-center gap-1 transition-colors"
          :class="$route.path === '/cart' ? 'text-forest-500' : 'text-zinc-400'"
        >
          <div class="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 6.53A1 1 0 007.63 21h8.74a1 1 0 00.98-1.22L16 13M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z"
              />
            </svg>
            <span
              v-if="cartStore.totalItems > 0"
              class="absolute -top-1.5 -right-1.5 bg-forest-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center"
            >
              {{ cartStore.totalItems }}
            </span>
          </div>
          <span class="text-[10px] font-medium">Cart</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
  <InstallBanner />
</template>

<script setup>
const cartStore = useCartStore();
const myOrdersStore = useCustomerOrdersStore();
const customerStore = useCustomerStore();
const mobileAccountOpen = ref(false);
const { isSupported, subscribe } = usePushNotifications();

onMounted(() => {
  customerStore.hydrate()
  setTimeout(() => {
    if (isSupported.value && customerStore.isAuthenticated) {
      subscribe(`Bearer ${customerStore.token}`)
    }
  }, 3000)
});
</script>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
</style>
