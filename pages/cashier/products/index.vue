<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <p class="text-xs text-zinc-500 font-medium">{{ total }} product{{ total !== 1 ? 's' : '' }}</p>
      <NuxtLink v-if="canCreate" to="/cashier/products/new" class="btn-primary text-xs py-2 px-4">+ Add product</NuxtLink>
    </div>

    <div v-if="loading" class="card p-8 text-center text-zinc-400 text-sm animate-pulse">Loading...</div>

    <div v-else-if="!products.length" class="card p-14 text-center">
      <p class="text-zinc-400 text-sm">No products yet.</p>
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[480px]">
          <thead class="border-b border-zinc-100">
            <tr>
              <th class="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Product</th>
              <th class="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Category</th>
              <th class="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Price</th>
              <th class="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Stock</th>
              <th v-if="canEdit" class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100">
            <tr v-for="product in products" :key="product.id" class="hover:bg-zinc-50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <ProductImage :src="product.imageUrl" :alt="product.name" class="w-9 h-9 rounded-xl object-cover bg-zinc-100 shrink-0" />
                  <div>
                    <p class="font-medium text-zinc-900 text-sm">{{ product.name }}</p>
                    <p v-if="product.brand" class="text-[11px] text-zinc-400">{{ product.brand }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-zinc-400 text-xs">{{ product.category?.name ?? '—' }}</td>
              <td class="px-4 py-3 font-semibold text-zinc-700">ETB {{ Number(product.price).toFixed(2) }}</td>
              <td class="px-4 py-3">
                <span :class="product.stock === 0 ? 'badge-red' : product.stock < 10 ? 'badge-yellow' : 'badge-green'" class="badge">{{ product.stock }}</span>
              </td>
              <td v-if="canEdit" class="px-4 py-3 text-right">
                <NuxtLink :to="`/cashier/products/${product.id}`" class="text-xs text-brand-500 hover:text-brand-600 transition-colors font-medium">Edit</NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-between pt-2">
      <button :disabled="page === 1" class="text-sm font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-3 py-1.5" @click="changePage(page - 1)">← Previous</button>
      <span class="text-sm text-zinc-400">Page {{ page }} of {{ totalPages }}</span>
      <button :disabled="page === totalPages" class="text-sm font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-3 py-1.5" @click="changePage(page + 1)">Next →</button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['cashier'], layout: 'cashier', ssr: false })

const { adminFetch } = useAdminFetch()
const adminStore = useAdminStore()

const products = ref([])
const loading = ref(true)
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)

const permissions = computed(() => adminStore.user?.permissions ?? [])
const canCreate = computed(() => permissions.value.includes('products:create'))
const canEdit = computed(() => permissions.value.includes('products:edit'))

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

onMounted(fetchProducts)
useHead({ title: 'Products — Cashier' })
</script>
