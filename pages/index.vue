<template>
  <div>
    <!-- Hero -->
    <div class="relative overflow-hidden border-b border-zinc-200 bg-white">
      <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div class="max-w-6xl mx-auto px-4 py-16 sm:py-24 text-center relative">
        <div class="inline-flex items-center gap-2 bg-brand-500/10 text-brand-600 border border-brand-200 rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
          <span class="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          Fresh deliveries, daily
        </div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-900 mb-5 leading-tight tracking-tight">
          Fresh groceries,<br class="hidden sm:block" />
          <span class="text-brand-500">delivered fast</span>
        </h1>
        <p class="text-zinc-500 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
          Shop by category and get everything you need, right to your door.
        </p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-10 sm:py-14 space-y-12 sm:space-y-16">

      <!-- Loading -->
      <div v-if="pending">
        <div class="h-4 w-32 bg-zinc-100 rounded animate-pulse mb-5" />
        <div class="flex gap-3 overflow-hidden">
          <div v-for="n in 2" :key="n" class="shrink-0 w-[280px] sm:w-full aspect-[5/3] rounded-2xl bg-zinc-100 animate-pulse" />
        </div>
      </div>

      <div v-else-if="error" class="text-center py-16">
        <p class="text-brand-600 text-sm">Failed to load. Please refresh.</p>
      </div>

      <template v-else>
        <!-- Featured Products -->
        <section v-if="featuredProducts?.length">
          <div class="flex items-center justify-between gap-3 mb-6">
            <div class="flex items-center gap-3">
              <h2 class="text-lg font-bold text-zinc-900 tracking-tight">Staff Picks</h2>
              <span class="badge badge-red">Featured</span>
            </div>
          </div>
          <div class="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible">
            <div class="flex gap-3 sm:gap-4 pb-2 sm:pb-0 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:flex-none">
              <div v-for="product in featuredProducts" :key="product.id" class="shrink-0 w-[260px] sm:w-auto sm:min-w-0">
                <FeaturedProductCard :product="product" />
              </div>
            </div>
          </div>
        </section>

        <!-- Trending -->
        <section v-if="trendingCategories.length">
          <div class="flex items-center gap-3 mb-6">
            <h2 class="text-lg font-bold text-zinc-900 tracking-tight">Trending Now</h2>
            <span class="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-2.5 py-0.5 text-xs font-semibold">
              <span class="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
              Hot this week
            </span>
          </div>
          <div class="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible">
            <div class="flex gap-3 sm:gap-4 pb-2 sm:pb-0 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:flex-none">
              <TrendingCategoryCard v-for="cat in trendingCategories" :key="cat.id" :category="cat" />
            </div>
          </div>
        </section>

        <!-- All categories -->
        <section v-if="regularCategories.length">
          <h2 class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">
            {{ trendingCategories.length ? 'All Categories' : 'Shop by Category' }}
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            <CategoryCard v-for="cat in regularCategories" :key="cat.id" :category="cat" />
          </div>
        </section>

        <div v-if="!trendingCategories.length && !regularCategories.length && !featuredProducts?.length" class="text-center py-16 text-zinc-400 text-sm">
          No products yet. Check back soon!
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
const { data: categories, pending, error } = await useFetch('/api/categories')
const { data: featuredProducts } = await useFetch('/api/products?featured=true')

const trendingCategories = computed(() => categories.value?.filter((c) => c.isTrending) ?? [])
const regularCategories = computed(() => categories.value?.filter((c) => !c.isTrending) ?? [])

useHead({ title: 'Jam Store — Fresh Groceries' })
</script>
