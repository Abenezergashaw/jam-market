<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
          <span class="text-2xl font-black text-white">J</span>
        </div>
        <h1 class="text-2xl font-black text-zinc-900 tracking-tight">Welcome back</h1>
        <p class="text-zinc-500 text-sm mt-1.5">Sign in to place your order</p>
      </div>

      <div class="card p-6 space-y-5">
        <!-- Telegram button area -->
        <div class="flex flex-col items-center gap-3">
          <p class="text-xs text-zinc-500 text-center">One click — no passwords needed</p>

          <!-- Telegram widget renders here -->
          <div ref="widgetEl" class="flex justify-center" />

          <div v-if="loading" class="text-xs text-zinc-400 animate-pulse">Signing you in…</div>
          <div v-if="authError" class="text-xs text-red-500 text-center">{{ authError }}</div>
        </div>

        <div class="border-t border-zinc-100 pt-4">
          <div class="flex items-start gap-2.5 text-xs text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 text-[#229ED9] mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.31 13.9l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.838.659z"/>
            </svg>
            <span>We use Telegram to verify your identity. You'll need the Telegram app installed on your device.</span>
          </div>
        </div>
      </div>

      <p class="text-center text-xs text-zinc-400 mt-5">
        By signing in you agree to our terms of service.
        <br />Your cart items are saved and will be ready after login.
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ ssr: false })

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const customerStore = useCustomerStore()

const widgetEl = ref(null)
const loading = ref(false)
const authError = ref('')

// If already logged in, redirect immediately
if (customerStore.isAuthenticated) {
  navigateTo(route.query.redirect || '/')
}

onMounted(() => {
  customerStore.hydrate()
  if (customerStore.isAuthenticated) {
    router.push(route.query.redirect || '/')
    return
  }

  window.onTelegramAuth = async (telegramData) => {
    loading.value = true
    authError.value = ''
    try {
      await customerStore.loginWithTelegram(telegramData)
      router.push(route.query.redirect || '/')
    } catch (e) {
      authError.value = e?.data?.statusMessage ?? 'Login failed. Please try again.'
    } finally {
      loading.value = false
    }
  }

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.setAttribute('data-telegram-login', config.public.telegramBotUsername)
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-onauth', 'onTelegramAuth(user)')
  script.setAttribute('data-request-access', 'write')
  widgetEl.value.appendChild(script)
})

onUnmounted(() => {
  delete window.onTelegramAuth
})

useHead({ title: 'Sign In — Jam Store' })
</script>
