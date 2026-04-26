<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <p class="text-xs text-zinc-500 font-medium">{{ products?.length ?? 0 }} products</p>
      <NuxtLink to="/admin/products/new" class="btn-primary text-xs py-2 px-4">+ Add product</NuxtLink>
    </div>

    <div v-if="pending" class="card p-8 text-center text-zinc-400 text-sm animate-pulse">Loading...</div>

    <div v-else-if="!products?.length" class="card p-14 text-center">
      <p class="text-zinc-400 text-sm mb-3">No products yet.</p>
      <NuxtLink to="/admin/products/new" class="text-brand-500 hover:text-brand-600 text-sm transition-colors font-semibold">Create the first one →</NuxtLink>
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[560px]">
          <thead class="border-b border-zinc-100">
            <tr>
              <th class="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Product</th>
              <th class="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Category</th>
              <th class="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Price</th>
              <th class="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Stock</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100">
            <tr v-for="product in products" :key="product.id" class="hover:bg-zinc-50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img :src="product.imageUrl" :alt="product.name" class="w-9 h-9 rounded-xl object-cover bg-zinc-100 shrink-0" @error="$event.target.src = 'https://picsum.photos/36/36'" />
                  <div>
                    <p class="font-medium text-zinc-900 text-sm">{{ product.name }}</p>
                    <p v-if="product.brand" class="text-[11px] text-zinc-400">{{ product.brand }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-zinc-400 text-xs">{{ product.category?.name ?? '—' }}</td>
              <td class="px-4 py-3 font-semibold text-zinc-700">${{ Number(product.price).toFixed(2) }}</td>
              <td class="px-4 py-3">
                <span :class="product.stock === 0 ? 'badge-red' : product.stock < 10 ? 'badge-yellow' : 'badge-green'" class="badge">
                  {{ product.stock }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-3">
                  <NuxtLink :to="`/admin/products/${product.id}`" class="text-xs text-brand-500 hover:text-brand-600 transition-colors font-medium">Edit</NuxtLink>
                  <button class="text-xs text-zinc-400 hover:text-brand-500 transition-colors" @click="deleteProduct(product)">Delete</button>
                </div>
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
const { data: products, pending, refresh } = useAsyncData('products', () => adminFetch('/api/products'))

async function deleteProduct(product) {
  if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
  try {
    await adminFetch(`/api/products/${product.id}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    alert(e?.data?.statusMessage ?? 'Could not delete product')
  }
}

useHead({ title: 'Products — Admin' })
</script>
