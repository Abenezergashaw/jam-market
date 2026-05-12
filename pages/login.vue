<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">

      <!-- Logo -->
      <div class="text-center mb-8">
        <img src="/logo.svg" alt="Jam Store" class="h-16 w-auto mx-auto mb-4" onerror="this.src='/logo.jpg'" />
        <h1 class="text-2xl font-black text-zinc-900 tracking-tight">
          {{ step === 'phone' ? 'One more step' : mode === 'signin' ? 'Welcome back' : 'Create account' }}
        </h1>
        <p class="text-zinc-500 text-sm mt-1.5">
          {{ step === 'phone' ? 'Add your phone number to continue' : mode === 'signin' ? 'Sign in to your account' : 'Join Jam Store today' }}
        </p>
      </div>

      <!-- ── Phone completion step (after OAuth) ─────────── -->
      <div v-if="step === 'phone'" class="card p-6 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-zinc-600 mb-1.5">Phone number *</label>
          <PhoneInput v-model="phoneForm.phone" @keyup.enter="submitPhone" />
        </div>

        <!-- Optional password -->
        <div>
          <button
            type="button"
            class="text-xs text-zinc-400 hover:text-zinc-600 underline underline-offset-2"
            @click="showPasswordInPhone = !showPasswordInPhone"
          >
            {{ showPasswordInPhone ? '− Remove password' : '+ Also set a password for phone login' }}
          </button>
          <div v-if="showPasswordInPhone" class="mt-2 relative">
            <input
              v-model="phoneForm.password"
              :type="showPwd ? 'text' : 'password'"
              class="input pr-10"
              placeholder="Min. 8 characters"
            />
            <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600" @click="showPwd = !showPwd">
              <svg v-if="!showPwd" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            </button>
          </div>
        </div>

        <p v-if="error" class="text-xs text-red-500">{{ error }}</p>

        <button class="btn-primary w-full" :disabled="submitting" @click="submitPhone">
          {{ submitting ? 'Saving…' : 'Continue' }}
        </button>
      </div>

      <!-- ── Success ─────────────────────────────────────── -->
      <div v-else-if="step === 'success'" class="card p-6">
        <div class="text-center py-4 space-y-2">
          <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-sm font-semibold text-zinc-800">Signed in!</p>
          <p class="text-xs text-zinc-400">Redirecting…</p>
        </div>
      </div>

      <!-- ── Main auth form ──────────────────────────────── -->
      <template v-else>
        <!-- Mode tabs -->
        <div class="flex gap-1 bg-zinc-100 rounded-xl p-1 mb-5">
          <button
            class="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
            :class="mode === 'signin' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'"
            @click="switchMode('signin')"
          >
            Sign In
          </button>
          <button
            class="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
            :class="mode === 'signup' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'"
            @click="switchMode('signup')"
          >
            Sign Up
          </button>
        </div>

        <div class="card p-6 space-y-4">

          <!-- Sign up: first name -->
          <div v-if="mode === 'signup'">
            <label class="block text-xs font-semibold text-zinc-600 mb-1.5">First name *</label>
            <input v-model="form.firstName" type="text" class="input" placeholder="Your name" @keyup.enter="submit" />
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-xs font-semibold text-zinc-600 mb-1.5">Phone number *</label>
            <PhoneInput v-model="form.phone" @keyup.enter="submit" />
          </div>

          <!-- Password -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-semibold text-zinc-600">Password *</label>
              <span v-if="mode === 'signup'" class="text-[11px] text-zinc-400">min. 8 characters</span>
            </div>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPwd ? 'text' : 'password'"
                class="input pr-10"
                :placeholder="mode === 'signup' ? 'Create a password' : 'Your password'"
                @keyup.enter="submit"
              />
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600" @click="showPwd = !showPwd">
                <svg v-if="!showPwd" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              </button>
            </div>
          </div>

          <p v-if="error" class="text-xs text-red-500">{{ error }}</p>

          <button class="btn-primary w-full" :disabled="submitting" @click="submit">
            {{ submitting
              ? (mode === 'signup' ? 'Creating account…' : 'Signing in…')
              : (mode === 'signup' ? 'Create Account' : 'Sign In') }}
          </button>

          <!-- Divider -->
          <div class="flex items-center gap-3 py-1">
            <div class="flex-1 h-px bg-zinc-200" />
            <span class="text-xs text-zinc-400 shrink-0">or continue with</span>
            <div class="flex-1 h-px bg-zinc-200" />
          </div>

          <!-- Social buttons -->
          <div class="space-y-2.5">
            <!-- Google -->
            <button
              class="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-all text-sm font-medium text-zinc-700"
              @click="loginWithGoogle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              Continue with Google
            </button>

            <!-- Telegram -->
            <div id="telegram-login-container" />
            <button
              class="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-all text-sm font-medium text-zinc-700"
              @click="loginWithTelegram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 text-[#229ED9]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.31 13.9l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.838.659z"/>
              </svg>
              Continue with Telegram
            </button>
          </div>
        </div>

        <p class="text-center text-xs text-zinc-400 mt-5">
          By signing in you agree to our terms of service.
        </p>
      </template>

    </div>
  </div>
</template>

<script setup>
definePageMeta({ ssr: false })

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const customerStore = useCustomerStore()

const mode = ref('signin')
const step = ref('main')
const submitting = ref(false)
const error = ref('')
const showPwd = ref(false)
const showPasswordInPhone = ref(false)

const form = reactive({ firstName: '', phone: '', password: '' })
const phoneForm = reactive({ phone: '', password: '' })

const pendingToken = ref(null)

if (customerStore.isAuthenticated) {
  navigateTo(route.query.redirect || '/')
}

function switchMode(m) {
  mode.value = m
  error.value = ''
  form.firstName = ''
  form.phone = ''
  form.password = ''
}

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    if (mode.value === 'signup') {
      await customerStore.register({
        firstName: form.firstName,
        phone: form.phone,
        password: form.password,
      })
    } else {
      await customerStore.loginWithPhone(form.phone, form.password)
    }
    step.value = 'success'
    setTimeout(() => router.push(route.query.redirect || '/'), 700)
  } catch (e) {
    error.value = e?.data?.statusMessage || e?.statusMessage || 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}

function loginWithGoogle() {
  window.location.href = '/api/auth/customer/google'
}

function loginWithTelegram() {
  const botUsername = config.public.telegramBotUsername
  if (!botUsername) {
    error.value = 'Telegram login is not configured.'
    return
  }

  window.TelegramLoginWidgetCallback = async (data) => {
    if (!data) return
    submitting.value = true
    error.value = ''
    try {
      const res = await $fetch('/api/auth/customer/telegram-login', {
        method: 'POST',
        body: data,
      })
      pendingToken.value = res.token
      customerStore.loginWithToken(res.token, res.user)
      if (res.needsPhone) {
        step.value = 'phone'
      } else {
        step.value = 'success'
        setTimeout(() => router.push(route.query.redirect || '/'), 700)
      }
    } catch (e) {
      error.value = e?.data?.statusMessage || 'Telegram login failed. Please try again.'
    } finally {
      submitting.value = false
    }
  }

  // Remove old script if present
  document.getElementById('tg-widget-script')?.remove()

  const script = document.createElement('script')
  script.id = 'tg-widget-script'
  script.async = true
  script.src = `https://telegram.org/js/telegram-widget.js?22`
  script.setAttribute('data-telegram-login', botUsername)
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-onauth', 'TelegramLoginWidgetCallback(user)')
  script.setAttribute('data-request-access', 'write')

  const container = document.getElementById('telegram-login-container')
  if (container) {
    container.innerHTML = ''
    container.appendChild(script)
  }
}

async function submitPhone() {
  error.value = ''
  submitting.value = true
  const token = pendingToken.value || route.query.token
  try {
    const result = await $fetch('/api/auth/customer/complete-profile', {
      method: 'POST',
      body: {
        phone: phoneForm.phone,
        ...(showPasswordInPhone.value && phoneForm.password ? { password: phoneForm.password } : {}),
      },
      headers: { Authorization: `Bearer ${token}` },
    })
    // If accounts were merged, the server returns a new token for the merged account
    if (result._newToken) {
      customerStore.loginWithToken(result._newToken, result)
    } else {
      customerStore.loginWithToken(token, { ...customerStore.user, ...result })
    }
    step.value = 'success'
    setTimeout(() => router.push(route.query.redirect || '/'), 700)
  } catch (e) {
    error.value = e?.data?.statusMessage || 'Failed to save phone number. Please try again.'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  customerStore.hydrate()
  if (customerStore.isAuthenticated) {
    router.push(route.query.redirect || '/')
    return
  }

  // Handle Google OAuth callback: /login?token=xxx&step=phone
  const token = route.query.token
  if (token) {
    try {
      const user = await $fetch('/api/auth/customer/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      pendingToken.value = token
      customerStore.loginWithToken(token, user)

      router.replace({ query: {} })

      if (route.query.step === 'phone') {
        step.value = 'phone'
      } else {
        step.value = 'success'
        setTimeout(() => router.push(route.query.redirect || '/'), 700)
      }
    } catch {
      error.value = 'Session expired. Please try again.'
    }
    return
  }

  // Error from failed OAuth
  if (route.query.error) {
    const msgs = {
      oauth_denied: 'Sign-in was cancelled.',
      oauth_state: 'Security check failed. Please try again.',
      oauth_token_exchange: 'Google login failed. Please try again.',
      oauth_profile: 'Could not retrieve your Google profile. Please try again.',
    }
    error.value = msgs[route.query.error] || 'Something went wrong. Please try again.'
    router.replace({ query: {} })
  }
})

useHead({ title: 'Sign In — Jam Store' })
</script>
