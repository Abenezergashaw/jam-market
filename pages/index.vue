<template>
  <div>
    <!-- Hero -->
    <div class="relative overflow-hidden border-b border-zinc-800/50">
      <div class="absolute inset-0 bg-gradient-to-br from-brand-950/40 via-zinc-950 to-zinc-950 pointer-events-none" />
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
      <div class="max-w-6xl mx-auto px-4 py-14 sm:py-20 text-center relative">
        <div class="inline-flex items-center gap-2 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full px-3 py-1 text-xs font-semibold mb-5">
          <span class="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          Fresh deliveries, daily
        </div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-50 mb-4 leading-tight tracking-tight">
          Fresh groceries,<br class="hidden sm:block" />
          <span class="text-brand-400">delivered fast</span>
        </h1>
        <p class="text-zinc-400 text-base sm:text-lg max-w-md mx-auto">
          Shop by category and get everything you need, right to your door.
        </p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10 sm:space-y-14">

      <!-- Loading skeleton -->
      <div v-if="pending">
        <div class="h-5 w-32 bg-zinc-800 rounded-lg animate-pulse mb-5" />
        <div class="flex gap-3 overflow-hidden">
          <div v-for="n in 2" :key="n" class="shrink-0 w-[280px] sm:w-full aspect-[5/3] rounded-2xl bg-zinc-800 animate-pulse" />
        </div>
      </div>

      <div v-else-if="error" class="text-center py-16">
        <p class="text-red-400 text-sm">Failed to load categories. Please refresh.</p>
      </div>

      <template v-else>
        <!-- ── Trending section ─────────────────────────────── -->
        <section v-if="trendingCategories.length">
          <!-- Section header -->
          <div class="flex items-center gap-3 mb-5 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="text-xl">🔥</span>
              <h2 class="text-lg font-bold text-zinc-50 tracking-tight">Trending Now</h2>
            </div>
            <span class="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full px-2.5 py-0.5 text-xs font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Hot this week
            </span>
          </div>

          <!-- Horizontal scroll on mobile, grid on desktop -->
          <div class="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible">
            <div class="flex gap-3 sm:gap-4 pb-2 sm:pb-0 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:flex-none">
              <TrendingCategoryCard
                v-for="cat in trendingCategories"
                :key="cat.id"
                :category="cat"
              />
            </div>
          </div>
        </section>

        <!-- ── All categories ──────────────────────────────── -->
        <section v-if="regularCategories.length">
          <h2 class="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-5">
            {{ trendingCategories.length ? 'All Categories' : 'Shop by Category' }}
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            <CategoryCard v-for="cat in regularCategories" :key="cat.id" :category="cat" />
          </div>
        </section>

        <!-- Empty -->
        <div v-if="!trendingCategories.length && !regularCategories.length" class="text-center py-16 text-zinc-500 text-sm">
          No categories yet. Check back soon!
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
const { data: categories, pending, error } = await useFetch('/api/categories')

const trendingCategories = computed(() => categories.value?.filter((c) => c.isTrending) ?? [])
const regularCategories = computed(() => categories.value?.filter((c) => !c.isTrending) ?? [])

useHead({ title: 'Jam Store — Fresh Groceries' })
</script>
