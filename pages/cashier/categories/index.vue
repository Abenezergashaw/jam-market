<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <p class="text-xs text-zinc-500 font-medium">{{ categories?.length ?? 0 }} categories</p>
      <NuxtLink v-if="canCreate" to="/cashier/categories/new" class="btn-primary text-xs py-2 px-4">+ Add category</NuxtLink>
    </div>

    <div v-if="pending" class="card p-8 text-center text-zinc-400 text-sm animate-pulse">Loading...</div>

    <div v-else-if="!categories?.length" class="card p-14 text-center">
      <p class="text-zinc-400 text-sm">No categories yet.</p>
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[360px]">
          <thead class="border-b border-zinc-100">
            <tr>
              <th class="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Category</th>
              <th class="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Slug</th>
              <th v-if="canEdit" class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100">
            <tr v-for="cat in categories" :key="cat.id" class="hover:bg-zinc-50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img :src="cat.imageUrl" :alt="cat.name" class="w-9 h-9 rounded-xl object-cover bg-zinc-100 shrink-0" @error="$event.target.src = 'https://picsum.photos/36/36'" />
                  <span class="font-medium text-zinc-900">{{ cat.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-zinc-400 font-mono text-xs">{{ cat.slug }}</td>
              <td v-if="canEdit" class="px-4 py-3 text-right">
                <NuxtLink :to="`/cashier/categories/${cat.id}`" class="text-xs text-brand-500 hover:text-brand-600 transition-colors font-medium">Edit</NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['cashier'], layout: 'cashier', ssr: false })

const { data: categories, pending } = await useFetch('/api/categories')
const adminStore = useAdminStore()

const permissions = computed(() => adminStore.user?.permissions ?? [])
const canCreate = computed(() => permissions.value.includes('categories:create'))
const canEdit = computed(() => permissions.value.includes('categories:edit'))

useHead({ title: 'Categories — Cashier' })
</script>
