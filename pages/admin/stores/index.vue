<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-zinc-900">Stores</h2>
        <p class="text-sm text-zinc-400 mt-0.5">Manage your supermarket locations.</p>
      </div>
      <NuxtLink to="/admin/stores/new" class="btn-primary shrink-0">+ Add Store</NuxtLink>
    </div>

    <div v-if="loading" class="card p-8 text-center text-zinc-400 text-sm animate-pulse">Loading…</div>

    <div v-else-if="stores.length === 0" class="card p-10 text-center">
      <div class="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
      </div>
      <p class="text-zinc-600 font-medium mb-1">No stores yet</p>
      <p class="text-zinc-400 text-sm mb-5">Add your first store location to enable delivery cost calculation.</p>
      <NuxtLink to="/admin/stores/new" class="btn-primary">Add Store</NuxtLink>
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="store in stores"
        :key="store.id"
        class="card p-4 flex items-start gap-4"
      >
        <div class="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="font-semibold text-zinc-900">{{ store.name }}</p>
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              :class="store.isActive ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'"
            >{{ store.isActive ? 'Active' : 'Inactive' }}</span>
          </div>
          <p v-if="store.address" class="text-sm text-zinc-500 mt-0.5 truncate">{{ store.address }}</p>
          <p v-if="store.lat && store.lng" class="text-xs text-zinc-400 mt-0.5">{{ Number(store.lat).toFixed(5) }}, {{ Number(store.lng).toFixed(5) }}</p>
          <div class="flex items-center gap-3 mt-1.5 text-xs text-zinc-400">
            <span v-if="store.costPerKm != null">ETB {{ Number(store.costPerKm).toFixed(2) }}/km</span>
            <span v-if="store.serviceChargePct != null">{{ Number(store.serviceChargePct).toFixed(1) }}% service</span>
            <span v-if="store.costPerKm == null && store.serviceChargePct == null" class="italic">Uses global rates</span>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <NuxtLink :to="`/admin/stores/${store.id}`" class="btn-secondary text-xs px-3 py-1.5">Edit</NuxtLink>
          <button
            class="text-xs px-3 py-1.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors font-medium"
            :disabled="deleting === store.id"
            @click="confirmDelete(store)"
          >{{ deleting === store.id ? '…' : 'Delete' }}</button>
        </div>
      </li>
    </ul>

    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const { adminFetch } = useAdminFetch()

const loading = ref(true)
const stores = ref([])
const deleting = ref(null)
const error = ref('')

onMounted(async () => {
  try {
    stores.value = await adminFetch('/api/admin/stores')
  } catch {
    error.value = 'Failed to load stores.'
  } finally {
    loading.value = false
  }
})

async function confirmDelete(store) {
  if (!confirm(`Delete "${store.name}"? This cannot be undone.`)) return
  deleting.value = store.id
  try {
    await adminFetch(`/api/admin/stores/${store.id}`, { method: 'DELETE' })
    stores.value = stores.value.filter(s => s.id !== store.id)
  } catch (e) {
    error.value = e?.data?.statusMessage ?? 'Failed to delete store.'
  } finally {
    deleting.value = null
  }
}

useHead({ title: 'Stores — Admin' })
</script>
