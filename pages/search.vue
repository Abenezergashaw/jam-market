<template>
  <div class="max-w-6xl mx-auto px-4 py-6 sm:py-10">

    <!-- Discovery state (no query) -->
    <div v-if="!q">
      <!-- Recent searches -->
      <section v-if="recentSearches.length > 0" class="mb-8">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Recent searches</h2>
          <button class="text-xs text-zinc-400 hover:text-zinc-600 transition-colors" @click="clearRecents">Clear all</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="s in recentSearches"
            :key="s"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors group"
            @click="navigateTo(`/search?q=${encodeURIComponent(s)}`)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ s }}
            <span
              class="ml-0.5 flex items-center text-zinc-300 group-hover:text-zinc-500 transition-colors"
              @click.stop="removeRecent(s)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          </button>
        </div>
      </section>

      <!-- Trending categories -->
      <section v-if="trendingCategories.length > 0" class="mb-8">
        <h2 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Trending categories</h2>
        <div class="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          <NuxtLink
            v-for="cat in trendingCategories"
            :key="cat.id"
            :to="`/category/${cat.id}`"
            class="shrink-0 flex flex-col items-center gap-2 w-[72px] group"
          >
            <div class="w-[72px] h-[72px] rounded-2xl overflow-hidden bg-zinc-100 ring-1 ring-zinc-100 group-hover:ring-brand-300 transition-all">
              <img :src="cat.imageUrl" :alt="cat.name" class="w-full h-full object-cover" />
            </div>
            <span class="text-xs font-medium text-zinc-700 text-center line-clamp-2 leading-tight w-full">{{ cat.name }}</span>
          </NuxtLink>
        </div>
      </section>

      <!-- Featured products -->
      <section v-if="featuredProducts.length > 0" class="mb-8">
        <h2 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Featured products</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
          <ProductCard v-for="product in featuredProducts" :key="product.id" :product="product" />
        </div>
      </section>

      <!-- Fallback: nothing to show -->
      <div v-if="!recentSearches.length && !trendingCategories.length && !featuredProducts.length" class="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div class="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
        </div>
        <div>
          <p class="font-semibold text-zinc-800">Search for products</p>
          <p class="text-sm text-zinc-400 mt-1">Type in the search bar above to find what you need</p>
        </div>
      </div>
    </div>

    <!-- Search results state -->
    <template v-else>
      <!-- Header -->
      <div class="mb-5">
        <h1 class="text-xl font-bold text-zinc-900">Results for "{{ q }}"</h1>
        <p v-if="!pending" class="text-sm text-zinc-400 mt-0.5">
          {{ total }} product{{ total === 1 ? '' : 's' }} found
        </p>
      </div>

      <!-- Category chips -->
      <div v-if="filterCategories.length > 0" class="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-none">
        <NuxtLink
          :to="`/search?q=${encodeURIComponent(q)}`"
          class="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
          :class="!activeCategory ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'"
        >
          All
        </NuxtLink>
        <NuxtLink
          v-for="cat in filterCategories"
          :key="cat.id"
          :to="`/search?q=${encodeURIComponent(q)}&category=${cat.slug}`"
          class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
          :class="activeCategory === cat.slug ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'"
        >
          {{ cat.name }}
        </NuxtLink>
      </div>

      <!-- Loading skeleton -->
      <div v-if="pending && products.length === 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
        <div v-for="i in 8" :key="i" class="card overflow-hidden animate-pulse">
          <div class="aspect-square bg-zinc-100" />
          <div class="p-3 sm:p-4 space-y-2">
            <div class="h-3 bg-zinc-100 rounded-full w-1/3" />
            <div class="h-4 bg-zinc-100 rounded-full w-3/4" />
            <div class="h-3 bg-zinc-100 rounded-full w-full" />
          </div>
        </div>
      </div>

      <!-- No results -->
      <div v-else-if="!pending && products.length === 0" class="flex flex-col items-center justify-center py-20 text-center gap-3">
        <p class="font-semibold text-zinc-800">No products found</p>
        <p class="text-sm text-zinc-400">Try a different search term or browse categories</p>
        <NuxtLink to="/" class="mt-2 text-sm font-medium text-brand-600 hover:underline">Browse categories</NuxtLink>
      </div>

      <!-- Product grid -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>

      <!-- Load more -->
      <div v-if="hasMore" class="mt-8 flex justify-center">
        <button
          class="px-6 py-2.5 text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          :class="{ 'opacity-50 pointer-events-none': pending }"
          @click="loadMore"
        >
          {{ pending ? 'Loading…' : 'Load more' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const route = useRoute()

const q = computed(() => String(route.query.q ?? '').trim())
const activeCategory = computed(() => String(route.query.category ?? '').trim() || null)

// Search results state
const products = ref([])
const filterCategories = ref([])
const total = ref(0)
const page = ref(1)
const pending = ref(false)
const LIMIT = 24

// Discovery state
const recentSearches = ref([])
const featuredProducts = ref([])
const trendingCategories = ref([])
const STORAGE_KEY = 'jam-recent-searches'
const MAX_RECENTS = 5

onMounted(async () => {
  try {
    recentSearches.value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    recentSearches.value = []
  }

  try {
    const data = await $fetch('/api/products/discover')
    featuredProducts.value = data.featuredProducts
    trendingCategories.value = data.trendingCategories
  } catch { /* silently fail */ }
})

function saveRecentSearch(term) {
  if (!term) return
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    const filtered = existing.filter(s => s.toLowerCase() !== term.toLowerCase())
    const updated = [term, ...filtered].slice(0, MAX_RECENTS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    recentSearches.value = updated
  } catch { /* silently fail */ }
}

function removeRecent(term) {
  const updated = recentSearches.value.filter(s => s !== term)
  recentSearches.value = updated
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch { }
}

function clearRecents() {
  recentSearches.value = []
  try { localStorage.removeItem(STORAGE_KEY) } catch { }
}

async function fetchResults(reset = true) {
  if (!q.value) return
  pending.value = true
  try {
    const data = await $fetch('/api/products/search', {
      query: {
        q: q.value,
        page: page.value,
        limit: LIMIT,
        ...(activeCategory.value ? { category: activeCategory.value } : {}),
      },
    })
    if (reset) {
      products.value = data.products
      filterCategories.value = data.categories ?? []
    } else {
      products.value.push(...data.products)
    }
    total.value = data.total ?? 0
  } catch (e) {
    if (reset) products.value = []
  } finally {
    pending.value = false
  }
}

watch(
  [q, activeCategory],
  () => {
    if (q.value) saveRecentSearch(q.value)
    page.value = 1
    fetchResults(true)
  },
  { immediate: true },
)

const hasMore = computed(() => products.value.length < total.value)

async function loadMore() {
  page.value++
  await fetchResults(false)
}

useHead(() => ({
  title: q.value ? `"${q.value}" — Jam Store` : 'Search — Jam Store',
}))
</script>

<style scoped>
.scrollbar-none {
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
