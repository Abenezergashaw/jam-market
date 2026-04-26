<template>
  <div class="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
    <div class="card-elevated p-8 w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/25">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 class="text-xl font-bold text-zinc-900">Admin Login</h1>
        <p class="text-sm text-zinc-400 mt-1">Jam Store management</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <label class="label">Email</label>
          <input v-model="form.email" type="email" class="input" placeholder="admin@jamstore.com" required autofocus />
        </div>
        <div>
          <label class="label">Password</label>
          <input v-model="form.password" type="password" class="input" placeholder="••••••••" required />
        </div>

        <p v-if="error" class="text-sm text-brand-700 bg-brand-50 border border-brand-200 rounded-xl px-3 py-2">{{ error }}</p>

        <button type="submit" class="btn-primary w-full mt-2" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const adminStore = useAdminStore()
const router = useRouter()

if (adminStore.isAuthenticated) await navigateTo('/admin')

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await adminStore.login(form.email, form.password)
    router.push('/admin')
  } catch (e) {
    error.value = e?.data?.statusMessage ?? 'Invalid credentials'
  } finally {
    loading.value = false
  }
}

useHead({ title: 'Admin Login — Jam Store' })
</script>
