<template>
  <div class="space-y-5">

    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-base font-bold text-zinc-900">Products</h1>
        <p class="text-xs text-zinc-400 mt-0.5">{{ total }} product{{ total !== 1 ? 's' : '' }} total</p>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink to="/admin/products/import" class="btn-secondary inline-flex items-center gap-1.5 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import
        </NuxtLink>
        <NuxtLink to="/admin/products/new" class="btn-primary inline-flex items-center gap-1.5 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add product
        </NuxtLink>
      </div>
    </div>

    <!-- Search -->
    <div class="relative">
      <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name or SKU…"
        class="input pl-9 pr-8 w-full sm:w-72"
      />
      <button
        v-if="searchQuery"
        class="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
        @click="searchQuery = ''"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      <div v-for="i in 8" :key="i" class="rounded-2xl bg-white border border-zinc-100 overflow-hidden animate-pulse shadow-sm">
        <div class="aspect-square bg-zinc-100" />
        <div class="p-3 space-y-2.5">
          <div class="h-3 bg-zinc-100 rounded-full w-2/3" />
          <div class="h-4 bg-zinc-100 rounded-full w-full" />
          <div class="h-3 bg-zinc-100 rounded-full w-1/2" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!products.length" class="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-zinc-200 bg-white text-center">
      <div class="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <p class="font-semibold text-zinc-700">No products yet</p>
      <p class="text-sm text-zinc-400 mt-1 mb-5">Add your first product to get started</p>
      <NuxtLink to="/admin/products/new" class="btn-primary text-sm">Add product</NuxtLink>
    </div>

    <!-- Product grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      <div
        v-for="product in products"
        :key="product.id"
        class="group relative rounded-2xl bg-white border border-zinc-100 overflow-hidden shadow-sm hover:shadow-md hover:border-zinc-200 transition-all duration-200"
      >
        <!-- Image area -->
        <div class="relative aspect-square bg-zinc-50 overflow-hidden">
          <ProductImage
            :src="product.imageUrl"
            :alt="product.name"
            class="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
          />

          <!-- Upload progress overlay -->
          <div v-if="imgUploading === product.id" class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
            <svg class="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span class="text-white text-[10px] font-semibold">Uploading…</span>
          </div>

          <!-- Stock badge — top left -->
          <div class="absolute top-2 left-2">
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow"
              :class="product.stock === 0 ? 'bg-red-500' : product.stock < 10 ? 'bg-amber-500' : 'bg-emerald-500'"
            >
              <span class="w-1 h-1 rounded-full bg-white/70" :class="product.stock > 0 ? 'animate-pulse' : ''" />
              {{ product.stock === 0 ? 'Out of stock' : product.stock < 10 ? `${product.stock} left` : product.stock }}
            </span>
          </div>

          <!-- Featured star — top right -->
          <div v-if="product.isFeatured" class="absolute top-2 right-2">
            <span class="w-6 h-6 flex items-center justify-center rounded-full bg-brand-500 text-white shadow text-[11px] font-black">★</span>
          </div>

          <!-- Hover actions overlay -->
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-4 gap-2">
            <!-- Photo upload button -->
            <label class="inline-flex items-center gap-1.5 bg-white text-zinc-900 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-brand-500 hover:text-white transition-colors shadow-sm cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Photo
              <input type="file" accept="image/*" class="hidden" @change="uploadImage(product, $event)" />
            </label>

            <NuxtLink
              :to="`/admin/products/${product.id}`"
              class="inline-flex items-center gap-1.5 bg-white text-zinc-900 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-brand-500 hover:text-white transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </NuxtLink>
            <button
              class="inline-flex items-center gap-1.5 bg-white text-zinc-900 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors shadow-sm"
              @click.stop="deleteProduct(product)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        <!-- Card body -->
        <div class="p-3">
          <!-- Category + brand row -->
          <div class="flex items-center gap-1.5 mb-1.5 min-w-0">
            <button
              class="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md max-w-[90px] truncate transition-colors"
              :class="product.category ? 'text-brand-600 bg-brand-50 hover:bg-brand-100' : 'text-zinc-400 bg-zinc-100 hover:bg-zinc-200'"
              @click.stop="openCategoryPicker(product)"
            >
              {{ product.category?.name ?? '+ category' }}
            </button>
            <span v-if="product.brand" class="text-[10px] text-zinc-400 truncate min-w-0">{{ product.brand }}</span>
          </div>

          <!-- Name -->
          <p class="text-sm font-semibold text-zinc-900 leading-snug line-clamp-2 mb-2.5">{{ product.name }}</p>

          <!-- Price row -->
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-bold text-zinc-900">ETB {{ Number(product.price).toFixed(0) }}</span>
            <NuxtLink
              :to="`/admin/products/${product.id}`"
              class="text-[10px] font-semibold text-zinc-400 hover:text-brand-500 transition-colors sm:hidden"
            >
              Edit →
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between pt-2">
      <button
        :disabled="page === 1"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-lg hover:bg-zinc-100 disabled:hover:bg-transparent"
        @click="changePage(page - 1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>
      <span class="text-xs font-medium text-zinc-400 bg-zinc-100 px-3 py-1.5 rounded-lg">{{ page }} / {{ totalPages }}</span>
      <button
        :disabled="page === totalPages"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-lg hover:bg-zinc-100 disabled:hover:bg-transparent"
        @click="changePage(page + 1)"
      >
        Next
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

  </div>

  <!-- Category picker (teleported outside grid to avoid overflow clipping) -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="catPickerProduct" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" @click.self="catPickerProduct = null">
        <div class="absolute inset-0 bg-black/40" @click="catPickerProduct = null" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-bold text-zinc-900">Change category</p>
              <p class="text-xs text-zinc-500 mt-0.5 line-clamp-1">{{ catPickerProduct.name }}</p>
            </div>
            <button class="text-zinc-400 hover:text-zinc-700 transition-colors shrink-0 mt-0.5" @click="catPickerProduct = null">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
              :class="!catPickerProduct.categoryId ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
              :disabled="catSaving"
              @click="setCategory(catPickerProduct, null)"
            >
              Uncategorized
            </button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
              :class="catPickerProduct.categoryId === cat.id ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'"
              :disabled="catSaving"
              @click="setCategory(catPickerProduct, cat.id)"
            >
              {{ cat.name }}
            </button>
          </div>

          <p v-if="catSaving" class="text-xs text-zinc-400">Saving…</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const { adminFetch } = useAdminFetch()

const products = ref([])
const loading = ref(true)
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)

const categories = ref([])
const imgUploading = ref(null)
const catPickerProduct = ref(null)
const catSaving = ref(false)
const searchQuery = ref('')
let searchTimer = null

async function fetchProducts() {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: page.value, limit: 20 })
    if (searchQuery.value.trim()) params.set('search', searchQuery.value.trim())
    const result = await adminFetch(`/api/products?${params}`)
    products.value = result.data
    total.value = result.total
    totalPages.value = result.totalPages
  } finally {
    loading.value = false
  }
}

watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    fetchProducts()
  }, 300)
})

function changePage(p) {
  page.value = p
  fetchProducts()
}

async function deleteProduct(product) {
  if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
  try {
    await adminFetch(`/api/products/${product.id}`, { method: 'DELETE' })
    await fetchProducts()
  } catch (e) {
    alert(e?.data?.statusMessage ?? 'Could not delete product')
  }
}

function openCategoryPicker(product) {
  catPickerProduct.value = product
}

async function setCategory(product, catId) {
  catSaving.value = true
  try {
    await adminFetch(`/api/products/${product.id}`, { method: 'PUT', body: { categoryId: catId } })
    product.categoryId = catId
    product.category = catId ? (categories.value.find((c) => c.id === catId) ?? null) : null
    catPickerProduct.value = null
  } catch (e) {
    alert(e?.data?.statusMessage ?? 'Could not update category')
  } finally {
    catSaving.value = false
  }
}

async function uploadImage(product, event) {
  const file = event.target.files?.[0]
  if (!file) return
  event.target.value = ''
  imgUploading.value = product.id
  try {
    const formData = new FormData()
    formData.append('image', file)
    const result = await adminFetch('/api/upload/image?folder=products', { method: 'POST', body: formData })

    if (!product.imageUrl) {
      // No primary image yet — set this as the primary
      await adminFetch(`/api/products/${product.id}`, { method: 'PUT', body: { imageUrl: result.url } })
      product.imageUrl = result.url
    } else {
      // Already has a primary image — append to additional images
      const existingUrls = (product.images ?? []).map((i) => i.url)
      const updatedImages = [...existingUrls, result.url]
      await adminFetch(`/api/products/${product.id}`, { method: 'PUT', body: { images: updatedImages } })
      if (!product.images) product.images = []
      product.images.push({ url: result.url, position: product.images.length })
    }
  } catch (e) {
    alert(e?.data?.statusMessage ?? 'Image upload failed')
  } finally {
    imgUploading.value = null
  }
}

onMounted(async () => {
  await fetchProducts()
  try {
    categories.value = await $fetch('/api/categories')
  } catch {}
})

useHead({ title: 'Products — Admin' })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
