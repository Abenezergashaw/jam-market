<template>
  <div class="max-w-6xl mx-auto px-4 py-6 sm:py-10">
    <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-brand-500 mb-6 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      All categories
    </NuxtLink>

    <!-- Loading skeleton -->
    <div v-if="pending" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
      <div v-for="n in 8" :key="n" class="rounded-2xl h-64 animate-pulse bg-zinc-100" />
    </div>

    <div v-else-if="error" class="text-center py-16 text-brand-600 text-sm">
      Failed to load products. Please try again.
    </div>

    <template v-else>
      <h1 class="text-2xl font-bold text-zinc-900 mb-6 tracking-tight">
        {{ categoryName }}
      </h1>

      <div v-if="!products.length" class="text-center py-16 text-zinc-400 text-sm">
        No products in this category yet.
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>

      <div v-if="hasMore" class="mt-8 flex justify-center">
        <button
          :disabled="loadingMore"
          class="btn-primary px-8 py-2.5 text-sm disabled:opacity-60"
          @click="loadMore"
        >
          <span v-if="loadingMore" class="inline-flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </span>
          <span v-else>Load more</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
const LIMIT = 20

const route = useRoute()
const id = computed(() => route.params.id)

const products = ref([])
const categoryName = ref('Products')
const total = ref(0)
const nextPage = ref(2)
const loadingMore = ref(false)

const hasMore = computed(() => products.value.length < total.value)

const { data, pending, error } = await useFetch(
  () => `/api/products?category_id=${id.value}&page=1&limit=${LIMIT}`,
)

watch(data, (v) => {
  if (v) {
    products.value = v.data
    total.value = v.total
    categoryName.value = v.data[0]?.category?.name ?? 'Products'
    nextPage.value = 2
  }
}, { immediate: true })

async function loadMore() {
  loadingMore.value = true
  try {
    const result = await $fetch(`/api/products?category_id=${id.value}&page=${nextPage.value}&limit=${LIMIT}`)
    products.value.push(...result.data)
    nextPage.value++
  } finally {
    loadingMore.value = false
  }
}

useHead({ title: 'Products — Jam Store' })
</script>
