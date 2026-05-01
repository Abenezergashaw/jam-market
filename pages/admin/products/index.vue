<template>
  <div class="space-y-5">

    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-base font-bold text-zinc-900">Products</h1>
        <p class="text-xs text-zinc-400 mt-0.5">{{ total }} product{{ total !== 1 ? 's' : '' }} total</p>
      </div>
      <NuxtLink to="/admin/products/new" class="btn-primary inline-flex items-center gap-1.5 text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add product
      </NuxtLink>
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
          <img
            :src="product.imageUrl"
            :alt="product.name"
            class="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
            @error="$event.target.src = `https://picsum.photos/seed/${product.id}/300/300`"
          />

          <!-- Stock badge — top left -->
          <div class="absolute top-2 left-2">
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow"
              :class="product.stock === 0 ? 'bg-red-500' : product.stock < 10 ? 'bg-amber-500' : 'bg-emerald-500'"
            >
              <span
                class="w-1 h-1 rounded-full bg-white/70"
                :class="product.stock > 0 ? 'animate-pulse' : ''"
              />
              {{ product.stock === 0 ? 'Out of stock' : product.stock < 10 ? `${product.stock} left` : product.stock }}
            </span>
          </div>

          <!-- Featured star — top right -->
          <div v-if="product.isFeatured" class="absolute top-2 right-2">
            <span class="w-6 h-6 flex items-center justify-center rounded-full bg-brand-500 text-white shadow text-[11px] font-black">★</span>
          </div>

          <!-- Hover actions overlay -->
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-4 gap-2">
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
            <span
              v-if="product.category"
              class="shrink-0 text-[10px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-md max-w-[90px] truncate"
            >{{ product.category.name }}</span>
            <span
              v-if="product.brand"
              class="text-[10px] text-zinc-400 truncate min-w-0"
            >{{ product.brand }}</span>
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
      <span class="text-xs font-medium text-zinc-400 bg-zinc-100 px-3 py-1.5 rounded-lg">
        {{ page }} / {{ totalPages }}
      </span>
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
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const { adminFetch } = useAdminFetch()

const products = ref([])
const loading = ref(true)
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)

async function fetchProducts() {
  loading.value = true
  try {
    const result = await adminFetch(`/api/products?page=${page.value}&limit=20`)
    products.value = result.data
    total.value = result.total
    totalPages.value = result.totalPages
  } finally {
    loading.value = false
  }
}

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

onMounted(() => fetchProducts())

useHead({ title: 'Products — Admin' })
</script>
