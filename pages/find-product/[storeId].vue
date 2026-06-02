<template>
  <div class="max-w-lg mx-auto px-4 py-10">
    <NuxtLink :to="`/info/${storeId}`" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-brand-500 transition-colors mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </NuxtLink>

    <h1 class="text-xl font-bold text-zinc-900 mb-1">Find a Product</h1>
    <p v-if="store" class="text-sm font-medium text-brand-600 mb-1">{{ store.name }}</p>
    <p class="text-sm text-zinc-500 mb-6">Select a category to see where products are located in this store.</p>

    <!-- Loading -->
    <div v-if="pending" class="space-y-3">
      <div v-for="n in 5" :key="n" class="card h-16 animate-pulse bg-zinc-50" />
    </div>

    <!-- No locations set -->
    <div v-else-if="!grouped.length" class="card p-12 text-center text-zinc-400">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <p class="text-sm">No product locations have been set for this store yet.</p>
      <p class="text-xs mt-1">Ask a staff member for assistance.</p>
    </div>

    <!-- Category list -->
    <template v-else-if="!activeCategory">
      <div class="card divide-y divide-zinc-100">
        <button
          v-for="group in grouped"
          :key="group.categoryName"
          class="w-full flex items-center gap-4 px-4 py-4 hover:bg-zinc-50 transition-colors text-left"
          @click="activeCategory = group.categoryName"
        >
          <div class="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-zinc-900 text-sm">{{ group.categoryName }}</p>
            <p class="text-xs text-zinc-400 mt-0.5">{{ group.products.length }} product{{ group.products.length !== 1 ? 's' : '' }} with location</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </template>

    <!-- Product list -->
    <template v-else>
      <button class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-brand-500 transition-colors mb-6" @click="activeCategory = null">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        All categories
      </button>

      <h2 class="text-lg font-bold text-zinc-900 mb-1">{{ activeCategory }}</h2>
      <p class="text-sm text-zinc-500 mb-4">{{ activeCategoryProducts.length }} product{{ activeCategoryProducts.length !== 1 ? 's' : '' }} with location</p>

      <div class="card divide-y divide-zinc-100">
        <div v-for="p in activeCategoryProducts" :key="p.id" class="flex items-center gap-4 px-4 py-4">
          <ProductImage :src="p.imageUrl" :alt="p.name" class="w-11 h-11 rounded-xl object-cover bg-zinc-100 shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-zinc-900 text-sm truncate">{{ p.name }}</p>
            <p v-if="p.brand" class="text-xs text-zinc-400">{{ p.brand }}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-sm font-bold text-brand-600">Aisle {{ p.aisle }}</p>
            <p v-if="p.shelf" class="text-xs text-zinc-500">Shelf {{ p.shelf }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
const route = useRoute()
const storeId = parseInt(route.params.storeId)

const { data: store } = await useFetch(`/api/stores/${storeId}`)

const pending = ref(true)
const allProducts = ref([])
const activeCategory = ref(null)

onMounted(async () => {
  try {
    allProducts.value = await $fetch('/api/products/location', { query: { storeId } })
  } finally {
    pending.value = false
  }
})

const grouped = computed(() => {
  const map = new Map()
  for (const p of allProducts.value) {
    const key = p.category?.name ?? 'Uncategorized'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(p)
  }
  return [...map.entries()].map(([categoryName, products]) => ({ categoryName, products }))
})

const activeCategoryProducts = computed(() =>
  grouped.value.find((g) => g.categoryName === activeCategory.value)?.products ?? []
)

useHead(() => ({
  title: store.value ? `Find a Product — ${store.value.name}` : 'Find a Product',
}))
</script>
