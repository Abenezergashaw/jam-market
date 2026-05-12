<template>
  <div class="max-w-6xl mx-auto px-4 py-6 sm:py-10">
    <!-- Back link -->
    <NuxtLink
      :to="product?.category ? `/category/${product.category.id}` : '/'"
      class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-8"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {{ product?.category?.name ?? $t('product.allCategories') }}
    </NuxtLink>

    <!-- Skeleton -->
    <div v-if="pending" class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
      <div class="aspect-square rounded-2xl bg-zinc-100 animate-pulse" />
      <div class="space-y-4 pt-4">
        <div class="h-3 w-24 bg-zinc-100 rounded animate-pulse" />
        <div class="h-8 w-3/4 bg-zinc-100 rounded-lg animate-pulse" />
        <div class="h-6 w-24 bg-zinc-100 rounded-lg animate-pulse" />
        <div class="space-y-2 mt-4">
          <div class="h-3 bg-zinc-100 rounded animate-pulse" />
          <div class="h-3 bg-zinc-100 rounded animate-pulse w-5/6" />
          <div class="h-3 bg-zinc-100 rounded animate-pulse w-4/6" />
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="!product" class="text-center py-24">
      <p class="text-zinc-400 mb-4">{{ $t('product.notFound') }}</p>
      <NuxtLink to="/" class="btn-primary">{{ $t('common.goHome') }}</NuxtLink>
    </div>

    <!-- Product -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

      <!-- Gallery -->
      <div class="space-y-3">
        <div class="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 group">
          <ProductImage
            :src="gallery[activeIdx]"
            :alt="product.name"
            class="w-full h-full object-cover transition-opacity duration-200"
          />

          <template v-if="gallery.length > 1">
            <button
              class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur border border-zinc-200 rounded-full flex items-center justify-center text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
              @click="prev"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur border border-zinc-200 rounded-full flex items-center justify-center text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
              @click="next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              <button
                v-for="(_, i) in gallery"
                :key="i"
                class="rounded-full transition-all"
                :class="activeIdx === i ? 'w-4 h-1.5 bg-brand-500' : 'w-1.5 h-1.5 bg-zinc-400/50 hover:bg-zinc-400'"
                @click="activeIdx = i"
              />
            </div>
          </template>

          <div v-if="product.stock === 0" class="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span class="text-sm font-semibold text-zinc-600 bg-white px-4 py-2 rounded-full border border-zinc-200 shadow-sm">{{ $t('product.outOfStock') }}</span>
          </div>
        </div>

        <!-- Thumbnails -->
        <div v-if="gallery.length > 1" class="flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="(img, i) in gallery"
            :key="i"
            class="shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all"
            :class="activeIdx === i ? 'border-brand-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'"
            @click="activeIdx = i"
          >
            <ProductImage :src="img" :alt="`Image ${i + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="flex flex-col gap-5 lg:pt-2">
        <!-- Breadcrumb -->
        <div class="flex items-center gap-1.5 text-xs text-zinc-400">
          <NuxtLink to="/" class="hover:text-zinc-700 transition-colors">{{ $t('common.home') }}</NuxtLink>
          <span>/</span>
          <template v-if="product.category">
            <NuxtLink :to="`/category/${product.category.id}`" class="hover:text-zinc-700 transition-colors">{{ product.category.name }}</NuxtLink>
            <span>/</span>
          </template>
          <span class="text-zinc-500 truncate max-w-[140px]">{{ product.name }}</span>
        </div>

        <!-- Brand + Name -->
        <div>
          <p v-if="product.brand" class="text-xs font-bold text-brand-500 uppercase tracking-widest mb-1.5">{{ product.brand }}</p>
          <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 leading-tight tracking-tight">{{ product.name }}</h1>
          <p v-if="product.sku" class="text-xs text-zinc-400 mt-1.5">#{{ product.sku }}</p>
        </div>

        <!-- Price -->
        <div class="flex items-center gap-3 flex-wrap">
          <span class="text-3xl font-black text-zinc-900">ETB {{ Number(product.price).toFixed(2) }}</span>
          <span v-if="product.unit" class="text-sm text-zinc-400">/ {{ product.unit }}</span>
          <span v-if="product.stock === 0" class="badge badge-red">{{ $t('product.outOfStock') }}</span>
          <span v-else-if="product.stock < 10" class="badge badge-yellow">{{ $t('product.left', { n: product.stock }) }}</span>
          <span v-else class="badge badge-green">{{ $t('product.inStock') }}</span>
        </div>

        <!-- Rating summary -->
        <div v-if="product.reviewCount > 0" class="flex items-center gap-2 -mt-1">
          <StarRating :model-value="product.avgRating" readonly size="sm" />
          <span class="text-xs text-zinc-500">{{ product.avgRating }} ({{ product.reviewCount }} {{ product.reviewCount === 1 ? 'review' : 'reviews' }})</span>
        </div>

        <!-- Description -->
        <p v-if="product.description" class="text-zinc-600 leading-relaxed text-sm sm:text-base">
          {{ product.description }}
        </p>

        <!-- Detail chips -->
        <div v-if="product.weight || product.countryOfOrigin || product.storageInstructions" class="flex flex-wrap gap-2">
          <span v-if="product.weight" class="inline-flex items-center gap-1.5 text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
            {{ product.weight }}
          </span>
          <span v-if="product.countryOfOrigin" class="inline-flex items-center gap-1.5 text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
            {{ product.countryOfOrigin }}
          </span>
          <span v-if="product.storageInstructions" class="inline-flex items-center gap-1.5 text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {{ product.storageInstructions }}
          </span>
        </div>

        <div class="border-t border-zinc-200 pt-5 space-y-4">
          <!-- Quantity -->
          <div v-if="product.stock > 0" class="flex items-center gap-3">
            <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider shrink-0">Qty</span>
            <div class="flex items-center bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
              <button
                class="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors disabled:opacity-30"
                :disabled="qty <= 1"
                @click="qty--"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
                </svg>
              </button>
              <span class="w-10 text-center text-sm font-bold text-zinc-900">{{ qty }}</span>
              <button
                class="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors disabled:opacity-30"
                :disabled="qty >= product.stock"
                @click="qty++"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Add to cart + Buy Now -->
          <div v-if="product.stock > 0" class="flex flex-col gap-2">
            <button class="btn-primary w-full py-3.5 text-sm font-bold" @click="handleAdd">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 6.53A1 1 0 007.63 21h8.74a1 1 0 00.98-1.22L16 13M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {{ added ? $t('product.added') : $t('product.addToCart') }}
            </button>
            <button class="btn-secondary w-full py-3.5 text-sm font-bold" @click="handleBuyNow">
              {{ $t('product.buyNow') }}
            </button>
          </div>

          <Transition enter-active-class="transition duration-150" enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="added" class="flex items-center gap-2 text-sm text-brand-600 font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {{ $t('product.addedItems', { n: qty }) }}
            </div>
          </Transition>
        </div>

        <!-- Category -->
        <div v-if="product.category" class="mt-auto pt-2">
          <NuxtLink
            :to="`/category/${product.category.id}`"
            class="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors bg-zinc-50 border border-zinc-200 hover:border-zinc-300 px-3 py-1.5 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {{ product.category.name }}
          </NuxtLink>
        </div>

        <!-- Ask a Question -->
        <div class="border-t border-zinc-100 pt-4">
          <template v-if="!customerStore.isAuthenticated">
            <NuxtLink
              :to="`/login?redirect=/product/${product.id}`"
              class="flex items-center gap-2 text-sm text-zinc-500 hover:text-brand-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
              </svg>
              {{ $t('product.signInToAsk') }}
            </NuxtLink>
          </template>
          <template v-else-if="askSent">
            <div class="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {{ $t('product.messageSent') }}
              <NuxtLink to="/messages" class="underline font-semibold ml-1">{{ $t('product.viewMessages') }}</NuxtLink>
            </div>
          </template>
          <template v-else>
            <button
              class="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-brand-600 transition-colors w-full text-left"
              @click="askOpen = !askOpen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
              </svg>
              {{ $t('product.askQuestion') }}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 ml-auto transition-transform" :class="{ 'rotate-180': askOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div v-if="askOpen" class="mt-3 space-y-3">
              <textarea
                v-model="askBody"
                rows="3"
                maxlength="1000"
                placeholder="Your question…"
                class="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
              />
              <!-- Image attachment -->
              <div v-if="askImageUrl" class="relative inline-block">
                <img :src="askImageUrl" class="w-20 h-20 rounded-xl object-cover border border-zinc-200" />
                <button
                  class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-zinc-800 text-white rounded-full flex items-center justify-center text-xs"
                  @click="askImageUrl = null"
                >×</button>
              </div>
              <div class="flex items-center gap-2">
                <input ref="askFileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleAskImageUpload" />
                <button
                  class="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 border border-zinc-200 rounded-lg px-2.5 py-1.5 transition-colors"
                  :disabled="askUploading"
                  @click="askFileInput.click()"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ askUploading ? $t('product.uploading') : $t('product.attachImage') }}
                </button>
                <button
                  class="btn-primary text-sm px-4 py-1.5 ml-auto"
                  :disabled="(!askBody.trim() && !askImageUrl) || askSending || askUploading"
                  @click="submitAsk"
                >
                  {{ askSending ? '…' : $t('product.send') }}
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Reviews section -->
    <div v-if="product" class="mt-12 border-t border-zinc-100 pt-10">
      <ProductReviews :product-id="product.id" />
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const cartStore = useCartStore()
const customerStore = useCustomerStore()

const { data: product, pending } = await useFetch(`/api/products/${route.params.id}`)

const gallery = computed(() => {
  if (!product.value) return []
  return [product.value.imageUrl, ...(product.value.images?.map((i) => i.url) ?? [])]
})

const outOfStock = computed(() => !product.value || product.value.stock === 0)

const activeIdx = ref(0)
const qty = ref(1)
const added = ref(false)
let addedTimer = null

function prev() { activeIdx.value = (activeIdx.value - 1 + gallery.value.length) % gallery.value.length }
function next() { activeIdx.value = (activeIdx.value + 1) % gallery.value.length }

function handleAdd() {
  if (!product.value) return
  for (let i = 0; i < qty.value; i++) {
    cartStore.addItem({ id: product.value.id, name: product.value.name, price: product.value.price, imageUrl: product.value.imageUrl })
  }
  added.value = true
  clearTimeout(addedTimer)
  addedTimer = setTimeout(() => { added.value = false }, 2000)
}

function handleBuyNow() {
  if (outOfStock.value) return
  for (let i = 0; i < qty.value; i++) {
    cartStore.addItem({ id: product.value.id, name: product.value.name, price: product.value.price, imageUrl: product.value.imageUrl })
  }
  navigateTo('/cart')
}

// Ask a question
const askOpen = ref(false)
const askBody = ref('')
const askImageUrl = ref(null)
const askUploading = ref(false)
const askSending = ref(false)
const askSent = ref(false)
const askFileInput = ref(null)

async function handleAskImageUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5 MB'); return }
  askUploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch('/api/customer/conversations/upload', {
      method: 'POST',
      body: fd,
      headers: { Authorization: `Bearer ${customerStore.token}` },
    })
    askImageUrl.value = res.imageUrl
  } catch (e) {
    alert(e?.data?.statusMessage ?? 'Upload failed')
  } finally {
    askUploading.value = false
    event.target.value = ''
  }
}

async function submitAsk() {
  if ((!askBody.value.trim() && !askImageUrl.value) || askSending.value) return
  askSending.value = true
  try {
    await $fetch('/api/customer/conversations', {
      method: 'POST',
      body: { productId: product.value.id, body: askBody.value.trim() || undefined, imageUrl: askImageUrl.value || undefined },
      headers: { Authorization: `Bearer ${customerStore.token}` },
    })
    askSent.value = true
  } catch (e) {
    alert(e?.data?.statusMessage ?? 'Failed to send message')
  } finally {
    askSending.value = false
  }
}

onUnmounted(() => clearTimeout(addedTimer))

useHead(() => ({
  title: product.value ? `${product.value.name} — Jam Store` : 'Product — Jam Store',
}))
</script>
