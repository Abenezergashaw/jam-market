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
        <table class="w-full text-sm min-w-[600px]">
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
            <tr v-for="user in users" :key="user.id" class="hover:bg-zinc-50 transition-colors" :class="!user.isActive ? 'opacity-60' : ''">
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
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink :to="`/admin/users/${user.id}`" class="text-xs text-brand-500 hover:text-brand-600 transition-colors font-medium">Edit</NuxtLink>

                  <!-- Deactivate / Reactivate -->
                  <button
                    class="text-xs font-medium transition-colors"
                    :class="user.isActive ? 'text-amber-500 hover:text-amber-700' : 'text-green-600 hover:text-green-800'"
                    :disabled="toggling === user.id"
                    @click="toggleActive(user)"
                  >
                    {{ toggling === user.id ? '…' : (user.isActive ? 'Deactivate' : 'Reactivate') }}
                  </button>

                  <!-- Delete (not for admins) -->
                  <button
                    v-if="user.role !== 'admin'"
                    class="text-xs font-medium text-zinc-400 hover:text-red-500 transition-colors"
                    :disabled="deleting === user.id"
                    @click="confirmDelete(user)"
                  >
                    {{ deleting === user.id ? '…' : 'Delete' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{{ error }}</p>
  </div>

  <!-- Delete confirmation modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="deleteTarget = null">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="deleteTarget = null" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="text-base font-bold text-zinc-900 mb-1">Delete {{ deleteTarget.name || deleteTarget.email }}?</h3>
          <p class="text-sm text-zinc-500 mb-6">This permanently removes their account and cannot be undone.</p>
          <div class="flex gap-3">
            <button class="flex-1 btn-secondary" :disabled="deleting === deleteTarget.id" @click="deleteTarget = null">Cancel</button>
            <button
              class="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
              :disabled="deleting === deleteTarget.id"
              @click="doDelete"
            >
              {{ deleting === deleteTarget.id ? 'Deleting…' : 'Yes, delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const { adminFetch } = useAdminFetch()

const users = ref([])
const stores = ref([])
const loading = ref(true)
const toggling = ref(null)
const deleting = ref(null)
const deleteTarget = ref(null)
const error = ref('')

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

async function toggleActive(user) {
  toggling.value = user.id
  error.value = ''
  try {
    const updated = await adminFetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      body: { isActive: !user.isActive },
    })
    const idx = users.value.findIndex(u => u.id === user.id)
    if (idx !== -1) users.value[idx] = { ...users.value[idx], isActive: updated.isActive }
  } catch (e) {
    error.value = e?.data?.statusMessage ?? 'Failed to update status'
  } finally {
    toggling.value = null
  }
}

function confirmDelete(user) {
  deleteTarget.value = user
}

async function doDelete() {
  const user = deleteTarget.value
  deleting.value = user.id
  error.value = ''
  try {
    await adminFetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    users.value = users.value.filter(u => u.id !== user.id)
    deleteTarget.value = null
  } catch (e) {
    error.value = e?.data?.statusMessage ?? 'Failed to delete user'
    deleteTarget.value = null
  } finally {
    deleting.value = null
  }
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

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
