<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <p class="text-sm text-zinc-500">{{ categories?.length ?? 0 }} categories</p>
      <NuxtLink to="/admin/categories/new" class="btn-primary text-sm py-2">+ Add category</NuxtLink>
    </div>

    <div v-if="pending" class="card p-8 text-center text-zinc-500 text-sm animate-pulse">Loading...</div>

    <div v-else-if="!categories?.length" class="card p-14 text-center">
      <p class="text-zinc-500 text-sm mb-3">No categories yet.</p>
      <NuxtLink to="/admin/categories/new" class="text-brand-400 hover:text-brand-300 text-sm transition-colors">Create the first one</NuxtLink>
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[420px]">
          <thead class="border-b border-zinc-800">
            <tr>
              <th class="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Slug</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800/60">
            <tr v-for="cat in categories" :key="cat.id" class="hover:bg-zinc-800/30 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img
                    :src="cat.imageUrl"
                    :alt="cat.name"
                    class="w-9 h-9 rounded-xl object-cover bg-zinc-800 shrink-0"
                    @error="$event.target.src = 'https://picsum.photos/36/36'"
                  />
                  <span class="font-medium text-zinc-200">{{ cat.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-zinc-500 font-mono text-xs">{{ cat.slug }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-3">
                  <NuxtLink :to="`/admin/categories/${cat.id}`" class="text-xs text-brand-400 hover:text-brand-300 transition-colors">Edit</NuxtLink>
                  <button class="text-xs text-zinc-600 hover:text-red-400 transition-colors" @click="deleteCategory(cat)">Delete</button>
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

const { data: categories, pending, refresh } = await useFetch('/api/categories')
const { adminFetch } = useAdminFetch()

async function deleteCategory(cat) {
  if (!confirm(`Delete "${cat.name}"? Products in this category will be affected.`)) return
  try {
    await adminFetch(`/api/categories/${cat.id}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    alert(e?.data?.statusMessage ?? 'Could not delete category')
  }
}

useHead({ title: 'Categories — Admin' })
</script>
