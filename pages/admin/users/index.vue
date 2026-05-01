<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <p class="text-xs text-zinc-500 font-medium">{{ users.length }} user{{ users.length !== 1 ? 's' : '' }}</p>
      <NuxtLink to="/admin/users/new" class="btn-primary text-xs py-2 px-4">+ Add user</NuxtLink>
    </div>

    <div v-if="loading" class="card p-8 text-center text-zinc-400 text-sm animate-pulse">Loading...</div>

    <div v-else-if="!users.length" class="card p-14 text-center">
      <p class="text-zinc-400 text-sm mb-3">No staff users yet.</p>
      <NuxtLink to="/admin/users/new" class="text-brand-500 hover:text-brand-600 text-sm transition-colors font-semibold">Create the first one →</NuxtLink>
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[560px]">
          <thead class="border-b border-zinc-100">
            <tr>
              <th class="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">User</th>
              <th class="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Role</th>
              <th class="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Store</th>
              <th class="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100">
            <tr v-for="user in users" :key="user.id" class="hover:bg-zinc-50 transition-colors">
              <td class="px-4 py-3">
                <p class="font-medium text-zinc-900">{{ user.name || '—' }}</p>
                <p class="text-xs text-zinc-400">{{ user.email }}</p>
              </td>
              <td class="px-4 py-3">
                <span class="badge" :class="roleClass(user.role)">{{ user.role }}</span>
              </td>
              <td class="px-4 py-3 text-zinc-500 text-xs">{{ storeNameById(user.storeId) }}</td>
              <td class="px-4 py-3">
                <span v-if="user.isActive" class="badge badge-green">Active</span>
                <span v-else class="badge badge-red">Inactive</span>
              </td>
              <td class="px-4 py-3 text-right">
                <NuxtLink :to="`/admin/users/${user.id}`" class="text-xs text-brand-500 hover:text-brand-600 transition-colors font-medium">Edit</NuxtLink>
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

const users = ref([])
const stores = ref([])
const loading = ref(true)

function roleClass(role) {
  if (role === 'admin') return 'badge-red'
  if (role === 'cashier') return 'badge-blue'
  if (role === 'delivery') return 'badge-orange'
  return ''
}

function storeNameById(id) {
  if (!id) return '—'
  return stores.value.find(s => s.id === id)?.name ?? `#${id}`
}

onMounted(async () => {
  try {
    const [u, s] = await Promise.all([
      adminFetch('/api/admin/users'),
      adminFetch('/api/admin/stores'),
    ])
    users.value = u
    stores.value = s
  } catch {}
  loading.value = false
})

useHead({ title: 'Users — Admin' })
</script>
