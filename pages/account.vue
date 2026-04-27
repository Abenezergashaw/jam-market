<template>
  <div class="max-w-xl mx-auto px-4 py-8 sm:py-10 space-y-6">
    <h1 class="text-2xl font-bold text-zinc-900 tracking-tight">My Account</h1>

    <div v-if="loading" class="space-y-4">
      <div class="card p-6 h-28 animate-pulse bg-zinc-50" />
      <div class="card p-6 h-24 animate-pulse bg-zinc-50" />
    </div>

    <template v-else>
      <!-- Profile card -->
      <div class="card p-6">
        <div class="flex items-center gap-4 mb-6">
          <img
            v-if="profile.photoUrl"
            :src="profile.photoUrl"
            :alt="fullName"
            class="w-16 h-16 rounded-2xl object-cover ring-2 ring-zinc-100 shrink-0"
          />
          <div v-else class="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-600 shrink-0">
            {{ profile.firstName?.[0] ?? '?' }}
          </div>
          <div>
            <p class="text-lg font-bold text-zinc-900">{{ fullName }}</p>
            <p v-if="profile.username" class="text-sm text-zinc-400">@{{ profile.username }}</p>
            <p class="text-xs text-zinc-400 mt-0.5">Member since {{ joinDate }}</p>
          </div>
        </div>

        <!-- Phone number -->
        <div>
          <label class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Phone number</label>
          <div v-if="!editingPhone" class="flex items-center gap-3">
            <span class="text-sm text-zinc-700 flex-1">{{ profile.phone || 'Not set' }}</span>
            <button class="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors" @click="startEdit">
              {{ profile.phone ? 'Change' : 'Add' }}
            </button>
          </div>
          <div v-else class="flex items-center gap-2">
            <input
              v-model="phoneInput"
              type="tel"
              placeholder="+251 9XX XXX XXXX"
              class="input text-sm flex-1"
              :disabled="saving"
              @keydown.enter="savePhone"
              @keydown.esc="cancelEdit"
            />
            <button :disabled="saving" class="btn-primary text-xs px-4 py-2 shrink-0" @click="savePhone">
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
            <button :disabled="saving" class="text-xs text-zinc-400 hover:text-zinc-600 transition-colors px-2 py-2" @click="cancelEdit">
              Cancel
            </button>
          </div>
          <p v-if="saveError" class="text-xs text-red-500 mt-1.5">{{ saveError }}</p>
        </div>
      </div>

      <!-- Quick links -->
      <div class="card divide-y divide-zinc-100">
        <NuxtLink to="/orders" class="flex items-center justify-between gap-3 px-5 py-4 hover:bg-zinc-50 transition-colors">
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span class="text-sm font-medium text-zinc-700">My Orders</span>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="ordersStore.orders.length" class="badge badge-yellow">{{ ordersStore.orders.length }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </NuxtLink>
      </div>

      <!-- Sign out -->
      <button
        class="w-full card px-5 py-4 flex items-center gap-3 hover:bg-red-50 hover:border-red-100 transition-all text-left"
        @click="signOut"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span class="text-sm font-medium text-red-500">Sign out</span>
      </button>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth'] })

const customerStore = useCustomerStore()
const ordersStore = useCustomerOrdersStore()
const router = useRouter()

const profile = ref({})
const loading = ref(true)
const editingPhone = ref(false)
const phoneInput = ref('')
const saving = ref(false)
const saveError = ref('')

const fullName = computed(() => [profile.value.firstName, profile.value.lastName].filter(Boolean).join(' '))
const joinDate = computed(() =>
  profile.value.createdAt
    ? new Date(profile.value.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : ''
)

async function fetchProfile() {
  try {
    profile.value = await $fetch('/api/auth/customer/me', {
      headers: { Authorization: `Bearer ${customerStore.token}` },
    })
  } finally {
    loading.value = false
  }
}

function startEdit() {
  phoneInput.value = profile.value.phone || ''
  saveError.value = ''
  editingPhone.value = true
}

function cancelEdit() {
  editingPhone.value = false
  saveError.value = ''
}

async function savePhone() {
  saving.value = true
  saveError.value = ''
  try {
    const updated = await $fetch('/api/customer/profile', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customerStore.token}` },
      body: { phone: phoneInput.value },
    })
    profile.value = { ...profile.value, phone: updated.phone }
    editingPhone.value = false
  } catch (e) {
    saveError.value = e?.data?.statusMessage ?? 'Could not save phone number'
  } finally {
    saving.value = false
  }
}

function signOut() {
  customerStore.logout()
  router.push('/')
}

onMounted(() => {
  fetchProfile()
  ordersStore.hydrate()
})

useHead({ title: 'My Account — Jam Store' })
</script>
