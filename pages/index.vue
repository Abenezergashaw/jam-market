<template>
  <div>
    <!-- Desktop green category nav bar -->
    <div class="hidden sm:block sticky top-14 z-30 bg-[#175B35] shadow-sm">
      <div class="max-w-6xl mx-auto px-4">
        <div
          v-if="!pending"
          class="flex items-center gap-0.5 h-11 overflow-x-auto scrollbar-none"
        >
          <NuxtLink
            v-for="cat in categories"
            :key="cat.id"
            :to="`/category/${cat.id}`"
            class="shrink-0 text-white/70 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white/10 transition-all whitespace-nowrap"
          >
            {{ cat.name }}
          </NuxtLink>
        </div>
        <div v-else class="flex items-center gap-3 h-11 px-1">
          <div
            v-for="i in 7"
            :key="i"
            class="h-3 bg-white/20 rounded-full animate-pulse"
            :style="`width:${55 + i * 7}px`"
          />
        </div>
      </div>
    </div>

    <!-- Hero Carousel -->
    <div
      class="relative overflow-hidden"
      style="height: 460px"
      @mouseenter="pauseCarousel"
      @mouseleave="resumeCarousel"
    >
      <div class="absolute inset-0">
        <transition-group
          name="carousel-fade"
          tag="div"
          class="relative w-full h-full"
        >
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
            <div
              class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
            />

            <div class="absolute inset-0 flex items-center">
              <div class="max-w-6xl mx-auto px-6 w-full">
                <div class="max-w-lg flex flex-col justify-center items-center">
                  <p
                    class="text-[12px] font-black text-white/80 uppercase tracking-[0.25em] mb-3"
                  >
                    JAM Supermarket
                  </p>
                  <h1
                    class="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-white mb-4 leading-tight tracking-tight drop-shadow-lg"
                  >
                    {{ slide.title }}
                  </h1>
                  <p
                    class="text-white/70 text-sm font-bold sm:text-base mb-8 max-w-sm leading-relaxed"
                  >
                    {{ slide.subtitle }}
                  </p>
                  <NuxtLink
                    :to="slide.cta.href"
                    class="inline-flex items-center gap-2 bg-[#175B35] hover:bg-[#134a2b] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-xl hover:-translate-y-0.5 uppercase tracking-wide"
                  >
                    {{ slide.cta.label }}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </transition-group>
      </div>

      <button
        class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/45 text-white transition-all z-10 backdrop-blur-sm"
        @click="prevSlide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/45 text-white transition-all z-10 backdrop-blur-sm"
        @click="nextSlide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <div
        class="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10"
      >
        <button
          v-for="(_, i) in slides"
          :key="i"
          class="transition-all duration-300 rounded-full"
          :class="
            currentSlide === i
              ? 'w-5 h-2 bg-white'
              : 'w-2 h-2 bg-white/40 hover:bg-white/70'
          "
          @click="goToSlide(i)"
        />
      </div>

      <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-10">
        <div
          class="h-full bg-[#175B35] transition-none"
          :style="{
            width: progressWidth + '%',
            transition: paused ? 'none' : `width ${INTERVAL}ms linear`,
          }"
        />
      </div>
    </div>

    <!-- Active promotions strip -->
    <div v-if="livePromos.length" class="promo-strip relative bg-[#175B35] overflow-hidden">
      <div class="promo-shine pointer-events-none absolute inset-0 z-10" />
      <div class="promo-ticker flex whitespace-nowrap py-3">
        <template v-for="_ in 4" :key="_">
          <div
            v-for="promo in livePromos"
            :key="promo.id + '_' + _"
            class="shrink-0 flex items-center gap-2 px-8 text-white border-r border-white/20"
          >
            <span class="text-sm">🎁</span>
            <p class="text-xs font-bold tracking-wide">{{ promo.name }}</p>
            <span v-if="promo.description" class="text-[11px] text-white/65 font-medium">— {{ promo.description }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- Main content -->
    <div class="max-w-6xl mx-auto px-4 pt-8 pb-14 space-y-12 sm:space-y-14">
      <!-- Loading skeleton -->
      <div v-if="pending" class="space-y-10">
        <div>
          <div class="h-4 w-36 bg-zinc-200 rounded animate-pulse mb-5" />
          <div class="flex gap-5 overflow-hidden">
            <div
              v-for="n in 7"
              :key="n"
              class="shrink-0 flex flex-col items-center gap-2"
            >
              <div class="w-16 h-16 rounded-full bg-zinc-200 animate-pulse" />
              <div class="h-2.5 w-14 bg-zinc-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div>
          <div class="h-4 w-48 bg-zinc-200 rounded animate-pulse mb-5" />
          <div class="flex gap-3 overflow-hidden">
            <div
              v-for="n in 4"
              :key="n"
              class="shrink-0 w-44 rounded-2xl bg-zinc-200 animate-pulse"
              style="height: 270px"
            />
          </div>
        </div>
      </div>

      <div v-else-if="error" class="text-center py-20">
        <p class="text-sm text-zinc-500">{{ $t('common.failedLoad') }}</p>
      </div>

      <template v-else>
        <!-- Shop by Category — circles -->
        <section v-if="categories?.length">
          <h2 class="text-lg font-bold text-zinc-900 mb-5">{{ $t('common.shopByCategory') }}</h2>
          <div
            class="flex gap-5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 scrollbar-none sm:flex-wrap"
          >
            <NuxtLink
              v-for="cat in categories"
              :key="cat.id"
              :to="`/category/${cat.id}`"
              class="shrink-0 flex flex-col items-center gap-2 group"
            >
              <div
                class="w-[62px] h-[62px] rounded-full overflow-hidden bg-zinc-100 ring-2 ring-transparent group-hover:ring-[#175B35] transition-all duration-200 shadow-sm"
              >
                <img
                  :src="cat.imageUrl"
                  :alt="cat.name"
                  loading="lazy"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  @error="
                    $event.target.src =
                      'https://picsum.photos/seed/' + cat.id + '/80/80'
                  "
                />
              </div>
              <span
                class="text-[11px] font-medium text-zinc-600 text-center line-clamp-2 leading-tight w-[70px] group-hover:text-[#175B35] transition-colors"
                >{{ cat.name }}</span
              >
            </NuxtLink>
          </div>
        </section>

        <!-- Top Picks This Week — featured products -->
        <section v-if="featuredProducts?.length">
          <div class="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 class="text-lg font-bold text-zinc-900">
                {{ $t('common.topPicks') }}
              </h2>
              <p class="text-xs text-zinc-400 mt-0.5">{{ $t('common.handpicked') }}</p>
            </div>
            <NuxtLink
              to="/search"
              class="text-xs font-semibold text-[#175B35] hover:underline whitespace-nowrap shrink-0"
              >{{ $t('common.seeAll') }}</NuxtLink
            >
          </div>

          <!-- Mobile: vertical list -->
          <div class="sm:hidden space-y-3">
            <NuxtLink
              v-for="(product, i) in featuredProducts.slice(0, 5)"
              :key="product.id"
              :to="`/product/${product.id}`"
              class="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm border border-zinc-100 hover:shadow-md transition-all"
            >
              <div
                class="relative w-[72px] h-[72px] rounded-xl overflow-hidden bg-zinc-100 shrink-0"
              >
                <ProductImage
                  :src="product.imageUrl"
                  :alt="product.name"
                  class="w-full h-full object-cover"
                />
                <div
                  class="absolute top-1 left-1 w-5 h-5 rounded-full bg-[#175B35] text-white text-[9px] font-black flex items-center justify-center shadow"
                >
                  {{ i + 1 }}
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p
                  v-if="product.brand"
                  class="text-[10px] text-zinc-400 uppercase tracking-wide truncate"
                >
                  {{ product.brand }}
                </p>
                <h3
                  class="text-sm font-semibold text-zinc-900 line-clamp-2 leading-snug"
                >
                  {{ product.name }}
                </h3>
                <p class="text-sm font-bold text-zinc-900 mt-1">
                  ETB {{ Number(product.price).toFixed(0) }}
                </p>
              </div>
              <button
                v-if="product.stock > 0"
                class="shrink-0 bg-[#1d72b8] hover:bg-[#155f9c] active:scale-95 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition-colors shadow-sm"
                @click.prevent.stop="addToCart(product)"
              >
                {{ $t('product.add') }}
              </button>
            </NuxtLink>
          </div>

          <!-- Desktop: horizontal card scroll -->
          <div
            class="hidden sm:flex gap-4 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 scrollbar-none"
          >
            <FeaturedProductCard
              v-for="(product, i) in featuredProducts"
              :key="product.id"
              :product="product"
              :index="i"
            />
          </div>
        </section>

        <!-- Trending Now -->
        <section v-if="trendingCategories.length">
          <div class="flex items-center gap-3 mb-5">
            <h2 class="text-lg font-bold text-zinc-900">{{ $t('common.trendingNow') }}</h2>
            <span
              class="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            >
              <span class="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
              {{ $t('common.hotThisWeek') }}
            </span>
          </div>
          <div
            class="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible"
          >
            <div
              class="flex gap-3 sm:gap-4 pb-2 sm:pb-0 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:flex-none"
            >
              <TrendingCategoryCard
                v-for="cat in trendingCategories"
                :key="cat.id"
                :category="cat"
              />
            </div>
          </div>
        </section>

        <!-- Browse All Categories grid -->
        <section v-if="regularCategories.length">
          <h2
            class="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-5"
          >
            {{ $t('common.browseAll') }}
          </h2>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
          >
            <CategoryCard
              v-for="cat in regularCategories"
              :key="cat.id"
              :category="cat"
            />
          </div>
        </section>

        <!-- Shop Everything — infinite scroll -->
        <section>
          <div class="flex items-center justify-between gap-3 mb-4">
            <h2 class="text-lg font-bold text-zinc-900">{{ $t('common.shopEverything') }}</h2>
            <span class="text-xs text-zinc-400">{{ $t('common.items', { n: shopTotal }) }}</span>
          </div>

          <!-- Category filter chips -->
          <div class="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 mb-5 scrollbar-none">
            <button
              class="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap"
              :class="shopCatId === null ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
              @click="setShopCat(null)"
            >{{ $t('search.all') }}</button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              class="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap"
              :class="shopCatId === cat.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
              @click="setShopCat(cat.id)"
            >{{ cat.name }}</button>
          </div>

          <!-- Product grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            <ProductCard v-for="p in shopProducts" :key="p.id" :product="p" />

            <!-- Skeleton cards while loading more -->
            <template v-if="shopLoadingMore">
              <div
                v-for="i in 10"
                :key="`sk-${i}`"
                class="rounded-2xl bg-white border border-zinc-100 overflow-hidden animate-pulse shadow-sm"
              >
                <div class="aspect-square bg-zinc-100" />
                <div class="p-3 space-y-2">
                  <div class="h-3 bg-zinc-100 rounded-full w-2/3" />
                  <div class="h-4 bg-zinc-100 rounded-full w-full" />
                  <div class="h-3 bg-zinc-100 rounded-full w-1/2" />
                </div>
              </div>
            </template>
          </div>

          <!-- Sentinel — watched by IntersectionObserver -->
          <div ref="shopSentinel" class="h-1 mt-4" />

          <p
            v-if="shopAllLoaded && shopProducts.length"
            class="text-center text-sm text-zinc-400 py-8"
          >{{ $t('common.seenEverything') }}</p>
        </section>

        <div
          v-if="!categories?.length && !featuredProducts?.length"
          class="text-center py-16 text-zinc-400 text-sm"
        >
          {{ $t('common.noProductsYet') }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
const INTERVAL = 5000;

const { data: slidesData } = await useFetch("/api/hero-slides");
const { data: promosData } = await useFetch("/api/promotions/active");
const livePromos = computed(() => promosData.value ?? []);
const slides = computed(() =>
  (slidesData.value ?? []).map((s) => ({
    id: s.id,
    image: s.imageUrl,
    alt: s.title,
    tag: s.tag,
    title: s.title,
    subtitle: s.subtitle,
    cta: { label: s.ctaLabel, href: s.ctaHref },
  })),
);

const currentSlide = ref(0);
const paused = ref(false);
const progressWidth = ref(0);
let timer = null;

function goToSlide(i) {
  currentSlide.value = i;
  resetProgress();
}

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length;
  resetProgress();
}

function prevSlide() {
  currentSlide.value =
    (currentSlide.value - 1 + slides.value.length) % slides.value.length;
  resetProgress();
}

function resetProgress() {
  progressWidth.value = 0;
  if (timer) clearInterval(timer);
  if (!paused.value) startTimer();
}

function startTimer() {
  progressWidth.value = 100;
  timer = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.value.length;
    progressWidth.value = 0;
    nextTick(() => {
      progressWidth.value = 100;
    });
  }, INTERVAL);
}

function pauseCarousel() {
  paused.value = true;
  if (timer) clearInterval(timer);
}

function resumeCarousel() {
  paused.value = false;
  startTimer();
}

onMounted(() => {
  nextTick(() => startTimer());
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const { data: categories, pending, error } = await useFetch("/api/categories");
const { data: featuredProducts } = await useFetch(
  "/api/products?featured=true",
);

const trendingCategories = computed(
  () => categories.value?.filter((c) => c.isTrending) ?? [],
);
const regularCategories = computed(
  () => categories.value?.filter((c) => !c.isTrending) ?? [],
);

const cartStore = useCartStore();
function addToCart(product) {
  cartStore.addItem({
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
  });
}

// Shop Everything — infinite scroll
const shopProducts = ref([]);
const shopPage = ref(1);
const shopTotal = ref(0);
const shopCatId = ref(null);
const shopLoadingMore = ref(false);
const shopFetched = ref(false);
const shopSentinel = ref(null);
const shopAllLoaded = computed(
  () => shopFetched.value && shopProducts.value.length >= shopTotal.value,
);

async function loadShopProducts() {
  if (shopLoadingMore.value || shopAllLoaded.value) return;
  shopLoadingMore.value = true;
  try {
    const params = new URLSearchParams({ page: shopPage.value, limit: 20 });
    if (shopCatId.value) params.set("category_id", shopCatId.value);
    const res = await $fetch(`/api/products?${params}`);
    shopProducts.value.push(...res.data);
    shopTotal.value = res.total;
    shopPage.value++;
    shopFetched.value = true;
  } finally {
    shopLoadingMore.value = false;
  }
}

function setShopCat(catId) {
  shopCatId.value = catId;
  shopProducts.value = [];
  shopPage.value = 1;
  shopTotal.value = 0;
  shopFetched.value = false;
  loadShopProducts();
}

onMounted(() => {
  loadShopProducts();

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) loadShopProducts();
    },
    { rootMargin: "300px" },
  );

  watch(
    shopSentinel,
    (el) => { if (el) observer.observe(el); },
    { immediate: true },
  );

  onUnmounted(() => observer.disconnect());
});

useHead({ title: "Jam Store — Fresh Groceries" });
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
.scrollbar-none {
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}

/* Promo strip ticker */
.promo-ticker {
  animation: ticker-scroll 28s linear infinite;
  will-change: transform;
}
.promo-strip:hover .promo-ticker {
  animation-play-state: paused;
}
@keyframes ticker-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* Shine sweep */
.promo-shine {
  background: linear-gradient(
    105deg,
    transparent 30%,
    rgba(255, 255, 255, 0.18) 50%,
    transparent 70%
  );
  animation: shine-sweep 3.2s ease-in-out infinite;
}
@keyframes shine-sweep {
  0%   { transform: translateX(-100%); }
  60%  { transform: translateX(200%); }
  100% { transform: translateX(200%); }
}
</style>
