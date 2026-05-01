<template>
  <div class="max-w-lg">
    <div class="mb-6">
      <NuxtLink to="/admin/users" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-brand-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to users
      </NuxtLink>
      <h2 class="text-lg font-bold text-zinc-900 mt-3">{{ isNew ? 'New user' : 'Edit user' }}</h2>
    </div>

    <div v-if="pageLoading" class="card h-64 animate-pulse bg-zinc-100" />

    <div v-else class="card p-5 sm:p-6">
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <!-- Name -->
        <div>
          <label class="label">Name</label>
          <input v-model="form.name" type="text" class="input" placeholder="Full name" />
        </div>

        <!-- Email -->
        <div>
          <label class="label">Email *</label>
          <input v-model="form.email" type="email" class="input" placeholder="staff@example.com" required :disabled="!isNew" :class="!isNew ? 'opacity-60 cursor-not-allowed' : ''" />
        </div>

        <!-- Password (create only) -->
        <div v-if="isNew">
          <label class="label">Password *</label>
          <input v-model="form.password" type="password" class="input" placeholder="Min 8 characters" required minlength="8" autocomplete="new-password" />
        </div>

        <!-- Role -->
        <div>
          <label class="label">Role *</label>
          <select v-model="form.role" class="input" required>
            <option value="admin">Admin</option>
            <option value="cashier">Cashier</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>

        <!-- Store (cashier + delivery) -->
        <div v-if="form.role === 'cashier' || form.role === 'delivery'">
          <label class="label">Store</label>
          <select v-model="form.storeId" class="input">
            <option :value="null">— No store —</option>
            <option v-for="store in stores" :key="store.id" :value="store.id">{{ store.name }}</option>
          </select>
        </div>

        <!-- Permissions (cashier only) -->
        <div v-if="form.role === 'cashier'" class="space-y-3">
          <label class="label">Permissions</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label v-for="perm in allPermissions" :key="perm.value" class="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200 cursor-pointer hover:bg-zinc-50 transition-colors" :class="form.permissions.includes(perm.value) ? 'border-brand-300 bg-brand-50/40' : ''">
              <input
                v-model="form.permissions"
                type="checkbox"
                :value="perm.value"
                class="accent-brand-500 w-4 h-4 shrink-0"
              />
              <div>
                <p class="text-sm font-medium text-zinc-800">{{ perm.label }}</p>
                <p class="text-[11px] text-zinc-400">{{ perm.group }}</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Active toggle (edit only) -->
        <div v-if="!isNew" class="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200">
          <div>
            <p class="text-sm font-medium text-zinc-800">Active account</p>
            <p class="text-xs text-zinc-500 mt-0.5">Inactive users cannot log in</p>
          </div>
          <button
            type="button"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0"
            :class="form.isActive ? 'bg-brand-500' : 'bg-zinc-300'"
            @click="form.isActive = !form.isActive"
          >
            <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform" :class="form.isActive ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>

        <p v-if="error" class="text-sm text-brand-700 bg-brand-50 border border-brand-200 rounded-xl px-3 py-2">{{ error }}</p>

        <div class="flex gap-3 pt-1">
          <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? 'Saving…' : (isNew ? 'Create user' : 'Update user') }}</button>
          <NuxtLink to="/admin/users" class="btn-secondary">Cancel</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const route = useRoute()
const router = useRouter()
const { adminFetch } = useAdminFetch()

const isNew = computed(() => route.params.id === 'new')
const pageLoading = ref(true)
const saving = ref(false)
const error = ref('')
const stores = ref([])

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: 'cashier',
  storeId: null,
  permissions: [],
  isActive: true,
})

const allPermissions = [
  { value: 'products:create', label: 'Add Products', group: 'Products' },
  { value: 'products:edit', label: 'Edit Products', group: 'Products' },
  { value: 'categories:create', label: 'Add Categories', group: 'Categories' },
  { value: 'categories:edit', label: 'Edit Categories', group: 'Categories' },
  { value: 'orders:approve', label: 'Approve Orders', group: 'Orders' },
  { value: 'orders:cancel', label: 'Cancel Orders', group: 'Orders' },
  { value: 'orders:dispatch', label: 'Dispatch Orders', group: 'Orders' },
]

onMounted(async () => {
  try {
    stores.value = await adminFetch('/api/admin/stores')
    if (!isNew.value) {
      const users = await adminFetch('/api/admin/users')
      const user = users.find(u => u.id === parseInt(route.params.id))
      if (user) {
        form.name = user.name ?? ''
        form.email = user.email
        form.role = user.role
        form.storeId = user.storeId ?? null
        form.permissions = user.permissions ?? []
        form.isActive = user.isActive ?? true
      }
    }
  } catch {}
  pageLoading.value = false
})

async function handleSubmit() {
  saving.value = true
  error.value = ''
  try {
    const body = {
      name: form.name,
      role: form.role,
      storeId: (form.role === 'cashier' || form.role === 'delivery') ? form.storeId : null,
      permissions: form.role === 'cashier' ? form.permissions : [],
    }
    if (isNew.value) {
      await adminFetch('/api/admin/users', {
        method: 'POST',
        body: { ...body, email: form.email, password: form.password },
      })
    } else {
      await adminFetch(`/api/admin/users/${route.params.id}`, {
        method: 'PUT',
        body: { ...body, isActive: form.isActive },
      })
    }
    router.push('/admin/users')
  } catch (e) {
    error.value = e?.data?.statusMessage ?? 'Something went wrong.'
  } finally {
    saving.value = false
  }
}

useHead({ title: isNew.value ? 'New User — Admin' : 'Edit User — Admin' })
</script>
