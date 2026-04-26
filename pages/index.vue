<template>
  <div>
    <!-- Hero Carousel -->
    <div
      class="relative overflow-hidden"
      style="height: 540px;"
      @mouseenter="pauseCarousel"
      @mouseleave="resumeCarousel"
    >
      <!-- Slides -->
      <div class="absolute inset-0">
        <transition-group name="carousel-fade" tag="div" class="relative w-full h-full">
          <div
            v-for="(slide, i) in slides"
            v-show="currentSlide === i"
            :key="slide.id"
            class="absolute inset-0"
          >
            <img
              :src="slide.image"
              :alt="slide.alt"
              class="w-full h-full object-cover"
            />
            <!-- Gradient overlay -->
            <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <!-- Slide content -->
            <div class="absolute inset-0 flex items-center">
              <div class="max-w-6xl mx-auto px-6 w-full">
                <div class="max-w-xl">
                  <span class="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white rounded-full px-4 py-1.5 text-xs font-semibold mb-5">
                    <span class="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                    {{ slide.tag }}
                  </span>
                  <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-lg">
                    {{ slide.title }}
                  </h1>
                  <p class="text-white/80 text-base sm:text-lg mb-8 leading-relaxed max-w-sm">
                    {{ slide.subtitle }}
                  </p>
                  <NuxtLink
                    :to="slide.cta.href"
                    class="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5"
                  >
                    {{ slide.cta.label }}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </transition-group>
      </div>

      <!-- Prev / Next arrows -->
      <button
        class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white hover:bg-white/30 transition-all duration-200 z-10"
        @click="prevSlide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white hover:bg-white/30 transition-all duration-200 z-10"
        @click="nextSlide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Dot indicators -->
      <div class="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        <button
          v-for="(_, i) in slides"
          :key="i"
          class="transition-all duration-300 rounded-full"
          :class="currentSlide === i ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'"
          @click="goToSlide(i)"
        />
      </div>

      <!-- Progress bar -->
      <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-10">
        <div
          class="h-full bg-brand-400 transition-none"
          :style="{ width: progressWidth + '%', transition: paused ? 'none' : `width ${INTERVAL}ms linear` }"
        />
      </div>
    </div>

    <!-- Wave divider -->
    <div class="relative bg-white">
      <svg class="absolute -top-px left-0 right-0 w-full" style="height:48px;" viewBox="0 0 1440 48" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 48 C360 0 1080 0 1440 48 L1440 0 L0 0 Z" fill="white" />
      </svg>
    </div>

    <!-- Content section -->
    <div class="max-w-6xl mx-auto px-4 pt-4 pb-10 sm:pb-14 space-y-12 sm:space-y-16">

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
const INTERVAL = 5000

const { data: slidesData } = await useFetch('/api/hero-slides')
const slides = computed(() => (slidesData.value ?? []).map((s) => ({
  id: s.id,
  image: s.imageUrl,
  alt: s.title,
  tag: s.tag,
  title: s.title,
  subtitle: s.subtitle,
  cta: { label: s.ctaLabel, href: s.ctaHref },
})))

const currentSlide = ref(0)
const paused = ref(false)
const progressWidth = ref(0)
let timer = null
let progressTimer = null

function goToSlide(i) {
  currentSlide.value = i
  resetProgress()
}

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
  resetProgress()
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length
  resetProgress()
}

function resetProgress() {
  progressWidth.value = 0
  if (timer) clearInterval(timer)
  if (!paused.value) startTimer()
}

function startTimer() {
  progressWidth.value = 100
  timer = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.value.length
    progressWidth.value = 0
    nextTick(() => { progressWidth.value = 100 })
  }, INTERVAL)
}

function pauseCarousel() {
  paused.value = true
  if (timer) clearInterval(timer)
}

function resumeCarousel() {
  paused.value = false
  startTimer()
}

onMounted(() => {
  nextTick(() => startTimer())
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const { data: categories, pending, error } = await useFetch('/api/categories')
const { data: featuredProducts } = await useFetch('/api/products?featured=true')

const trendingCategories = computed(() => categories.value?.filter((c) => c.isTrending) ?? [])
const regularCategories = computed(() => categories.value?.filter((c) => !c.isTrending) ?? [])

useHead({ title: 'Jam Store — Fresh Groceries' })
</script>

<style scoped>
.carousel-fade-enter-active,
.carousel-fade-leave-active {
  transition: opacity 0.7s ease;
  position: absolute;
  inset: 0;
}
.carousel-fade-enter-from,
.carousel-fade-leave-to {
  opacity: 0;
}
</style>
