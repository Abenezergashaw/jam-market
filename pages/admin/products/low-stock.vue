<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <h1 class="text-sm font-semibold text-zinc-200">Stock Management</h1>
      </div>
      <div class="flex items-center gap-1 bg-zinc-800 rounded-xl p-1">
        <button
          class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
          :class="tab === 'low' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'"
          @click="tab = 'low'"
        >
          Low Stock
          <span v-if="lowStock.length" class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[9px]">{{ lowStock.length }}</span>
        </button>
        <button
          class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
          :class="tab === 'out' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'"
          @click="tab = 'out'"
        >
          Out of Stock
          <span v-if="outOfStock.length" class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500/20 text-red-400 text-[9px]">{{ outOfStock.length }}</span>
        </button>
      </div>
    </div>

    <div v-if="pending" class="card p-8 text-center text-zinc-500 text-sm animate-pulse">Loading...</div>

    <div v-else-if="!visibleProducts.length" class="card p-14 text-center">
      <p class="text-zinc-400 text-sm">
        {{ tab === 'low' ? 'No low stock items. All products are well stocked!' : 'No out of stock products.' }}
      </p>
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[560px]">
          <thead class="border-b border-zinc-800">
            <tr>
              <th class="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Product</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Alert at</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Stock</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800/60">
            <tr v-for="product in visibleProducts" :key="product.id" class="hover:bg-zinc-800/30 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img
                    :src="product.imageUrl"
                    :alt="product.name"
                    class="w-9 h-9 rounded-xl object-cover bg-zinc-800 shrink-0"
                    @error="$event.target.src = 'https://picsum.photos/36/36'"
                  />
                  <div>
                    <p class="font-medium text-zinc-200">{{ product.name }}</p>
                    <p v-if="product.brand" class="text-xs text-zinc-500">{{ product.brand }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-zinc-500 text-xs">{{ product.category?.name ?? '—' }}</td>
              <td class="px-4 py-3 text-zinc-500 text-xs">{{ product.lowStockThreshold }}</td>
              <td class="px-4 py-3">
                <div v-if="editing[product.id] !== undefined" class="flex items-center gap-2">
                  <input
                    v-model.number="editing[product.id]"
                    type="number"
                    min="0"
                    class="input text-sm w-20 py-1.5 px-2"
                    @keydown.enter="saveStock(product)"
                    @keydown.esc="cancelEdit(product.id)"
                  />
                  <button class="text-xs text-brand-400 hover:text-brand-300 font-semibold transition-colors" @click="saveStock(product)">Save</button>
                  <button class="text-xs text-zinc-600 hover:text-zinc-400 transition-colors" @click="cancelEdit(product.id)">Cancel</button>
                </div>
                <div v-else class="flex items-center gap-2">
                  <span class="badge" :class="product.stock === 0 ? 'badge-red' : 'badge-yellow'">
                    {{ product.stock === 0 ? 'Out of stock' : `${product.stock} left` }}
                  </span>
                  <button class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors" @click="startEdit(product)">Edit</button>
                </div>
              </td>
              <td class="px-4 py-3 text-right">
                <NuxtLink :to="`/admin/products/${product.id}`" class="text-xs text-zinc-500 hover:text-brand-400 transition-colors">Full edit</NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const { adminFetch } = useAdminFetch()
const { data: products, pending, refresh } = useAsyncData('low-stock', () => adminFetch('/api/products/low-stock'))

const tab = ref('low')
const editing = reactive({})

const lowStock = computed(() => products.value?.filter((p) => p.stock > 0) ?? [])
const outOfStock = computed(() => products.value?.filter((p) => p.stock === 0) ?? [])
const visibleProducts = computed(() => tab.value === 'low' ? lowStock.value : outOfStock.value)

function startEdit(product) {
  editing[product.id] = product.stock
}
function cancelEdit(id) {
  delete editing[id]
}

async function saveStock(product) {
  const newStock = editing[product.id]
  if (newStock === undefined || newStock < 0) return
  try {
    await adminFetch(`/api/products/${product.id}`, { method: 'PATCH', body: { stock: newStock } })
    delete editing[product.id]
    await refresh()
  } catch (e) {
    alert(e?.data?.statusMessage ?? 'Could not update stock')
  }
}

useHead({ title: 'Low Stock — Admin' })
</script>
