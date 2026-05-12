<template>
  <div class="max-w-xl mx-auto px-4 py-8 sm:py-10 space-y-6">
    <h1 class="text-2xl font-bold text-zinc-900 tracking-tight">{{ $t('account.title') }}</h1>

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
            <p class="text-xs text-zinc-400 mt-0.5">{{ $t('account.memberSince', { date: joinDate }) }}</p>
          </div>
        </div>

        <!-- Phone number -->
        <div class="border-b border-zinc-100 pb-5 mb-5">
          <label class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">{{ $t('account.phoneNumber') }}</label>
          <div v-if="!editingPhone" class="flex items-center gap-3">
            <span class="text-sm text-zinc-700 flex-1">{{ profile.phone || $t('account.notSet') }}</span>
            <button class="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors" @click="startEdit">
              {{ profile.phone ? $t('account.change') : $t('account.add') }}
            </button>
          </div>
          <div v-else class="flex items-center gap-2">
            <PhoneInput
              v-model="phoneInput"
              :disabled="saving"
              @keydown.enter="savePhone"
              @keydown.esc="cancelEdit"
            />
            <button :disabled="saving" class="btn-primary text-xs px-4 py-2 shrink-0" @click="savePhone">
              {{ saving ? $t('account.saving') : $t('account.save') }}
            </button>
            <button :disabled="saving" class="text-xs text-zinc-400 hover:text-zinc-600 transition-colors px-2 py-2" @click="cancelEdit">
              {{ $t('account.cancel') }}
            </button>
          </div>
          <p v-if="saveError" class="text-xs text-red-500 mt-1.5">{{ saveError }}</p>
        </div>

        <!-- Password -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Password</label>
            <button v-if="!editingPassword" class="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors" @click="startEditPassword">
              {{ profile.hasPassword ? 'Change' : 'Set password' }}
            </button>
          </div>

          <div v-if="!editingPassword">
            <span class="text-sm text-zinc-400">{{ profile.hasPassword ? '••••••••' : 'Not set — you sign in via Google or Telegram' }}</span>
          </div>

          <div v-else class="space-y-2.5">
            <div v-if="profile.hasPassword" class="relative">
              <input v-model="pwForm.current" :type="showCurrentPwd ? 'text' : 'password'" class="input pr-10 text-sm" placeholder="Current password" />
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600" @click="showCurrentPwd = !showCurrentPwd">
                <svg v-if="!showCurrentPwd" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              </button>
            </div>
            <div class="relative">
              <input v-model="pwForm.new" :type="showNewPwd ? 'text' : 'password'" class="input pr-10 text-sm" placeholder="New password (min. 8 characters)" />
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600" @click="showNewPwd = !showNewPwd">
                <svg v-if="!showNewPwd" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              </button>
            </div>
            <p v-if="pwError" class="text-xs text-red-500">{{ pwError }}</p>
            <p v-if="pwSuccess" class="text-xs text-green-600">{{ pwSuccess }}</p>
            <div class="flex items-center gap-2">
              <button :disabled="savingPw" class="btn-primary text-xs px-4 py-2" @click="savePassword">
                {{ savingPw ? 'Saving…' : 'Save password' }}
              </button>
              <button class="text-xs text-zinc-400 hover:text-zinc-600 transition-colors px-2 py-2" @click="cancelEditPassword">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick links -->
      <div class="card divide-y divide-zinc-100">
        <NuxtLink to="/orders" class="flex items-center justify-between gap-3 px-5 py-4 hover:bg-zinc-50 transition-colors">
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span class="text-sm font-medium text-zinc-700">{{ $t('account.myOrders') }}</span>
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
        <span class="text-sm font-medium text-red-500">{{ $t('account.signOut') }}</span>
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

const editingPassword = ref(false)
const savingPw = ref(false)
const pwError = ref('')
const pwSuccess = ref('')
const showCurrentPwd = ref(false)
const showNewPwd = ref(false)
const pwForm = reactive({ current: '', new: '' })

const fullName = computed(() => [profile.value.firstName, profile.value.lastName].filter(Boolean).join(' '))
const joinDate = computed(() =>
  profile.value.createdAt
    ? new Date(profile.value.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : ''
)

async function fetchProfile() {
  try {
    const data = await $fetch('/api/auth/customer/me', {
      headers: { Authorization: `Bearer ${customerStore.token}` },
    })
    profile.value = data
  } finally {
    loading.value = false
  }
}

function startEditPassword() {
  pwForm.current = ''
  pwForm.new = ''
  pwError.value = ''
  pwSuccess.value = ''
  editingPassword.value = true
}

function cancelEditPassword() {
  editingPassword.value = false
  pwError.value = ''
  pwSuccess.value = ''
}

async function savePassword() {
  pwError.value = ''
  pwSuccess.value = ''
  savingPw.value = true
  try {
    await $fetch('/api/auth/customer/password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerStore.token}` },
      body: {
        currentPassword: pwForm.current || undefined,
        newPassword: pwForm.new,
      },
    })
    profile.value = { ...profile.value, hasPassword: true }
    pwSuccess.value = 'Password saved successfully.'
    pwForm.current = ''
    pwForm.new = ''
    setTimeout(() => { editingPassword.value = false; pwSuccess.value = '' }, 1500)
  } catch (e) {
    pwError.value = e?.data?.statusMessage ?? 'Could not save password'
  } finally {
    savingPw.value = false
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
