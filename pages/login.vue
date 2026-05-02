<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
          <span class="text-2xl font-black text-white">J</span>
        </div>
        <h1 class="text-2xl font-black text-zinc-900 tracking-tight">Sign in</h1>
        <p class="text-zinc-500 text-sm mt-1.5">Use Telegram to verify your identity</p>
      </div>

      <div class="card p-6 space-y-5">

        <!-- Step 1: Show OTP -->
        <template v-if="otp && !loggedIn">
          <div class="text-center space-y-4">
            <p class="text-sm text-zinc-600">Open <span class="font-semibold text-[#229ED9]">@{{ botUsername }}</span> on Telegram and send this code:</p>

            <!-- OTP display -->
            <div class="flex items-center justify-center gap-2">
              <span class="text-4xl font-black tracking-[0.3em] text-zinc-900 font-mono select-all">{{ otp }}</span>
              <button
                class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                title="Copy code"
                @click="copyOtp"
              >
                <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>

            <!-- Open bot button -->
            <a
              :href="`https://t.me/${botUsername}`"
              target="_blank"
              rel="noopener"
              class="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.31 13.9l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.838.659z"/>
              </svg>
              Open @{{ botUsername }}
            </a>

            <!-- Polling status -->
            <div class="flex items-center justify-center gap-2 text-xs text-zinc-400">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              Waiting for verification…
            </div>

            <!-- Timer -->
            <p class="text-xs text-zinc-400">
              Code expires in <span class="font-medium text-zinc-600">{{ countdown }}s</span>
            </p>

            <!-- Error -->
            <p v-if="error" class="text-xs text-red-500">{{ error }}</p>

            <!-- Get new code -->
            <button class="text-xs text-zinc-400 hover:text-zinc-600 underline underline-offset-2 transition-colors" @click="requestOtp">
              Get a new code
            </button>
          </div>
        </template>

        <!-- Step 0: Loading initial OTP -->
        <template v-else-if="!otp && !loggedIn">
          <div class="text-center py-4">
            <div class="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p class="text-sm text-zinc-400">Preparing sign-in…</p>
          </div>
        </template>

        <!-- Success -->
        <template v-else-if="loggedIn">
          <div class="text-center py-4 space-y-2">
            <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-zinc-800">Signed in!</p>
            <p class="text-xs text-zinc-400">Redirecting…</p>
          </div>
        </template>

        <div class="border-t border-zinc-100 pt-4">
          <div class="flex items-start gap-2.5 text-xs text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 text-[#229ED9] mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.31 13.9l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.838.659z"/>
            </svg>
            <span>Open our Telegram bot, send the code above, and you'll be signed in instantly — no password needed.</span>
          </div>
        </div>
      </div>

      <p class="text-center text-xs text-zinc-400 mt-5">
        By signing in you agree to our terms of service.
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

const botUsername = config.public.telegramBotUsername || 'jamsupermarketbot'

const otp = ref(null)
const expiresAt = ref(null)
const loggedIn = ref(false)
const error = ref('')
const copied = ref(false)
const countdown = ref(600)

let pollTimer = null
let countdownTimer = null

if (customerStore.isAuthenticated) {
  navigateTo(route.query.redirect || '/')
}

async function requestOtp() {
  otp.value = null
  error.value = ''
  clearTimers()
  try {
    const res = await $fetch('/api/auth/customer/otp/request', { method: 'POST' })
    otp.value = res.otp
    expiresAt.value = new Date(res.expiresAt)
    startCountdown()
    startPolling()
  } catch {
    error.value = 'Failed to generate code. Please refresh the page.'
  }
}

async function copyOtp() {
  if (!otp.value) return
  await navigator.clipboard.writeText(otp.value).catch(() => {})
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function startCountdown() {
  const end = expiresAt.value?.getTime() ?? Date.now() + 600000
  countdownTimer = setInterval(() => {
    const remaining = Math.max(0, Math.floor((end - Date.now()) / 1000))
    countdown.value = remaining
    if (remaining === 0) {
      clearTimers()
      error.value = 'Code expired. Getting a new one…'
      setTimeout(requestOtp, 1500)
    }
  }, 1000)
}

function startPolling() {
  pollTimer = setInterval(async () => {
    if (!otp.value) return
    try {
      const res = await $fetch('/api/auth/customer/otp/verify', {
        method: 'POST',
        body: { otp: otp.value },
      })
      if (res.verified) {
        clearTimers()
        customerStore.token = res.token
        customerStore.user = res.user
        if (import.meta.client) {
          localStorage.setItem('customer_token', res.token)
          localStorage.setItem('customer_user', JSON.stringify(res.user))
        }
        loggedIn.value = true
        setTimeout(() => router.push(route.query.redirect || '/'), 800)
      }
    } catch (e) {
      if (e?.statusCode === 410) {
        clearTimers()
        error.value = 'Code expired. Getting a new one…'
        setTimeout(requestOtp, 1500)
      }
    }
  }, 2000)
}

function clearTimers() {
  clearInterval(pollTimer)
  clearInterval(countdownTimer)
  pollTimer = null
  countdownTimer = null
}

onMounted(() => {
  customerStore.hydrate()
  if (customerStore.isAuthenticated) {
    router.push(route.query.redirect || '/')
    return
  }
  requestOtp()
})

onUnmounted(clearTimers)

useHead({ title: 'Sign In — Jam Store' })
</script>
