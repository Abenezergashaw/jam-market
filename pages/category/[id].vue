<template>
  <div class="max-w-6xl mx-auto px-4 py-6 sm:py-10">
    <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-brand-400 mb-6 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      All categories
    </NuxtLink>

    <!-- Loading skeleton -->
    <div v-if="pending" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
      <div v-for="n in 8" :key="n" class="rounded-2xl h-64 animate-pulse bg-zinc-800" />
    </div>

    <div v-else-if="error" class="text-center py-16 text-red-400 text-sm">
      Failed to load products. Please try again.
    </div>

    <template v-else>
      <h1 class="text-2xl font-bold text-zinc-50 mb-6 tracking-tight">
        {{ products?.[0]?.category?.name ?? 'Products' }}
      </h1>

      <div v-if="!products?.length" class="text-center py-16 text-zinc-500 text-sm">
        No products in this category yet.
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
    </template>
  </div>
</template>

<script setup>
const route = useRoute()
const id = computed(() => route.params.id)

const { data: products, pending, error } = await useFetch(
  () => `/api/products?category_id=${id.value}`,
)

useHead({ title: 'Products — Jam Store' })
</script>
