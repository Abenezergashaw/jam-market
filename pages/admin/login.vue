<template>
  <div class="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-gradient-to-br from-brand-950/20 via-transparent to-transparent pointer-events-none" />
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

    <div class="card p-8 w-full max-w-sm relative">
      <div class="text-center mb-7">
        <div class="w-12 h-12 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 class="text-xl font-bold text-zinc-50">Admin Login</h1>
        <p class="text-sm text-zinc-500 mt-1">Jam Store management</p>
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

        <p v-if="error" class="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{{ error }}</p>

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

if (adminStore.isAuthenticated) {
  await navigateTo('/admin')
}

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
