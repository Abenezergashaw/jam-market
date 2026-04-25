<template>
  <div class="max-w-6xl mx-auto px-4 py-6 sm:py-10">
    <!-- Back link -->
    <NuxtLink
      :to="product?.category ? `/category/${product.category.id}` : '/'"
      class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-brand-400 transition-colors mb-6"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {{ product?.category?.name ?? 'All categories' }}
    </NuxtLink>

    <!-- Loading skeleton -->
    <div v-if="pending" class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
      <div class="aspect-square rounded-2xl bg-zinc-800 animate-pulse" />
      <div class="space-y-4 pt-4">
        <div class="h-4 w-24 bg-zinc-800 rounded-lg animate-pulse" />
        <div class="h-8 w-3/4 bg-zinc-800 rounded-lg animate-pulse" />
        <div class="h-6 w-24 bg-zinc-800 rounded-lg animate-pulse" />
        <div class="space-y-2 mt-4">
          <div class="h-4 bg-zinc-800 rounded-lg animate-pulse" />
          <div class="h-4 bg-zinc-800 rounded-lg animate-pulse w-5/6" />
          <div class="h-4 bg-zinc-800 rounded-lg animate-pulse w-4/6" />
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="!product" class="text-center py-24">
      <p class="text-zinc-400 mb-4">Product not found.</p>
      <NuxtLink to="/" class="btn-primary">Go home</NuxtLink>
    </div>

    <!-- Product layout -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

      <!-- ── Image gallery ──────────────────────────── -->
      <div class="space-y-3">
        <!-- Main image -->
        <div class="relative aspect-square rounded-2xl overflow-hidden bg-zinc-800 group">
          <img
            :src="gallery[activeIdx]"
            :alt="product.name"
            class="w-full h-full object-cover transition-opacity duration-200"
            @error="$event.target.src = 'https://picsum.photos/seed/' + product.id + '/600/600'"
          />

          <!-- Nav arrows — only when multiple images -->
          <template v-if="gallery.length > 1">
            <button
              class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              @click="prev"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              @click="next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <!-- Dot indicators -->
            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              <button
                v-for="(_, i) in gallery"
                :key="i"
                class="rounded-full transition-all"
                :class="activeIdx === i ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'"
                @click="activeIdx = i"
              />
            </div>
          </template>

          <!-- Stock overlay -->
          <div v-if="product.stock === 0" class="absolute inset-0 bg-zinc-950/60 flex items-center justify-center">
            <span class="text-sm font-semibold text-zinc-300 bg-zinc-900/80 px-4 py-2 rounded-full border border-zinc-700">Out of stock</span>
          </div>
        </div>

        <!-- Thumbnails -->
        <div v-if="gallery.length > 1" class="flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="(img, i) in gallery"
            :key="i"
            class="shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all"
            :class="activeIdx === i ? 'border-brand-400 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'"
            @click="activeIdx = i"
          >
            <img
              :src="img"
              :alt="`Image ${i + 1}`"
              class="w-full h-full object-cover"
              @error="$event.target.src = 'https://picsum.photos/64/64'"
            />
          </button>
        </div>
      </div>

      <!-- ── Product info ────────────────────────────── -->
      <div class="flex flex-col gap-5 lg:pt-2">

        <!-- Breadcrumb -->
        <div class="flex items-center gap-1.5 text-xs text-zinc-500">
          <NuxtLink to="/" class="hover:text-brand-400 transition-colors">Home</NuxtLink>
          <span class="text-zinc-700">/</span>
          <template v-if="product.category">
            <NuxtLink :to="`/category/${product.category.id}`" class="hover:text-brand-400 transition-colors">
              {{ product.category.name }}
            </NuxtLink>
            <span class="text-zinc-700">/</span>
          </template>
          <span class="text-zinc-400 truncate max-w-[140px]">{{ product.name }}</span>
        </div>

        <!-- Name -->
        <h1 class="text-2xl sm:text-3xl font-bold text-zinc-50 leading-tight tracking-tight">{{ product.name }}</h1>

        <!-- Price + stock badge -->
        <div class="flex items-center gap-3 flex-wrap">
          <span class="text-3xl font-bold text-brand-400">${{ Number(product.price).toFixed(2) }}</span>
          <span v-if="product.stock === 0" class="badge badge-red">Out of stock</span>
          <span v-else-if="product.stock < 10" class="badge badge-yellow">Only {{ product.stock }} left</span>
          <span v-else class="badge badge-green">In stock</span>
        </div>

        <!-- Description -->
        <p v-if="product.description" class="text-zinc-400 leading-relaxed text-sm sm:text-base">
          {{ product.description }}
        </p>

        <div class="border-t border-zinc-800 pt-5 space-y-4">
          <!-- Quantity selector -->
          <div v-if="product.stock > 0" class="flex items-center gap-3">
            <label class="text-sm font-medium text-zinc-400 shrink-0">Quantity</label>
            <div class="flex items-center bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
              <button
                class="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors disabled:opacity-40"
                :disabled="qty <= 1"
                @click="qty--"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
                </svg>
              </button>
              <span class="w-10 text-center text-sm font-semibold text-zinc-100">{{ qty }}</span>
              <button
                class="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors disabled:opacity-40"
                :disabled="qty >= product.stock"
                @click="qty++"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Add to cart -->
          <div v-if="product.stock > 0" class="flex gap-3">
            <button class="btn-primary flex-1 py-3 text-base" @click="handleAdd">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 6.53A1 1 0 007.63 21h8.74a1 1 0 00.98-1.22L16 13M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {{ added ? 'Added to cart!' : `Add ${qty > 1 ? qty + ' items' : ''} to cart` }}
            </button>
          </div>

          <!-- Added flash feedback -->
          <Transition enter-active-class="transition duration-150" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="added" class="flex items-center gap-2 text-sm text-brand-400 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {{ qty }} item{{ qty !== 1 ? 's' : '' }} added to your cart
            </div>
          </Transition>
        </div>

        <!-- Category tag -->
        <div v-if="product.category" class="mt-auto pt-2">
          <NuxtLink
            :to="`/category/${product.category.id}`"
            class="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-brand-400 transition-colors bg-zinc-800/60 border border-zinc-700/60 px-3 py-1.5 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {{ product.category.name }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const cartStore = useCartStore()

const { data: product, pending } = await useFetch(`/api/products/${route.params.id}`)

const gallery = computed(() => {
  if (!product.value) return []
  return [
    product.value.imageUrl,
    ...(product.value.images?.map((i) => i.url) ?? []),
  ]
})

const activeIdx = ref(0)
const qty = ref(1)
const added = ref(false)
let addedTimer = null

function prev() {
  activeIdx.value = (activeIdx.value - 1 + gallery.value.length) % gallery.value.length
}
function next() {
  activeIdx.value = (activeIdx.value + 1) % gallery.value.length
}

function handleAdd() {
  if (!product.value) return
  for (let i = 0; i < qty.value; i++) {
    cartStore.addItem({
      id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      imageUrl: product.value.imageUrl,
    })
  }
  added.value = true
  clearTimeout(addedTimer)
  addedTimer = setTimeout(() => { added.value = false }, 2000)
}

onUnmounted(() => clearTimeout(addedTimer))

useHead(() => ({
  title: product.value ? `${product.value.name} — Jam Store` : 'Product — Jam Store',
}))
</script>
