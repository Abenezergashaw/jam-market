<template>
  <div class="max-w-lg space-y-6">
    <div>
      <h2 class="text-lg font-bold text-zinc-900">Store Settings</h2>
      <p class="text-sm text-zinc-400 mt-0.5">Configure delivery fees, store hours, and ordering rules.</p>
    </div>

    <div v-if="loading" class="card p-8 text-center text-zinc-400 text-sm animate-pulse">Loading…</div>

    <template v-else>
      <div class="card p-5 sm:p-6 space-y-5">

        <!-- Store open/closed toggle -->
        <div
          class="flex items-center justify-between gap-4 rounded-2xl px-4 py-4 border transition-colors duration-300"
          :class="form.storeIsOpen ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300"
              :class="form.storeIsOpen ? 'bg-emerald-100' : 'bg-red-100'"
            >
              <svg v-if="form.storeIsOpen" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-bold" :class="form.storeIsOpen ? 'text-emerald-800' : 'text-red-700'">
                {{ form.storeIsOpen ? 'Store is Open' : 'Store is Closed' }}
              </p>
              <p class="text-xs mt-0.5" :class="form.storeIsOpen ? 'text-emerald-600' : 'text-red-500'">
                <span v-if="togglingStore">Saving…</span>
                <span v-else>{{ form.storeIsOpen ? 'Accepting orders from customers' : 'Orders paused — banner shown to customers' }}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            class="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none shrink-0 disabled:opacity-60"
            :class="form.storeIsOpen ? 'bg-emerald-500' : 'bg-red-400'"
            :disabled="togglingStore"
            @click="toggleStoreStatus"
          >
            <span
              class="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300"
              :class="form.storeIsOpen ? 'translate-x-7' : 'translate-x-0'"
            />
          </button>
        </div>


        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label">Min order (ETB)</label>
            <input v-model.number="form.minOrderAmount" type="number" min="0" step="0.01" class="input" />
          </div>
          <div>
            <label class="label">Est. delivery (min)</label>
            <input v-model.number="form.estimatedDeliveryMinutes" type="number" min="1" class="input" />
          </div>
          <div>
            <label class="label">Default cost per km (ETB)</label>
            <input v-model.number="form.costPerKm" type="number" min="0" step="0.01" class="input" />
          </div>
          <div>
            <label class="label">Default service charge (%)</label>
            <input v-model.number="form.serviceChargePct" type="number" min="0" max="100" step="0.01" class="input" />
          </div>
        </div>

        <p class="text-xs text-zinc-400 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2">
          Per-store rates override these defaults. Go to
          <NuxtLink to="/admin/stores" class="text-brand-500 font-medium hover:underline">Stores</NuxtLink>
          to configure individual store locations and rates.
        </p>

        <p v-if="error" class="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{{ error }}</p>
        <p v-if="saved" class="text-xs text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2">Settings saved successfully.</p>

        <button class="btn-primary w-full" :disabled="saving" @click="handleSave">
          {{ saving ? 'Saving…' : 'Save Settings' }}
        </button>
      </div>

      <!-- Telegram Bot Webhook -->
      <div class="card p-5 sm:p-6 space-y-4">
        <div>
          <h3 class="text-sm font-semibold text-zinc-700">Telegram Bot — Login Webhook</h3>
          <p class="text-xs text-zinc-400 mt-0.5">Register the bot webhook so customers can sign in by sending a code to <span class="font-medium text-zinc-600">@{{ botUsername }}</span>. Run this once after every deploy.</p>
        </div>

        <div>
          <label class="label">Site URL</label>
          <input
            v-model="webhookSiteUrl"
            type="url"
            class="input"
            placeholder="https://your-domain.com"
          />
          <p class="text-xs text-zinc-400 mt-1.5">
            The public HTTPS address of this app. On <strong>Vercel/Railway</strong>: copy the deployment URL.
            On <strong>localhost</strong>: use an <a href="https://ngrok.com" target="_blank" class="text-brand-500 underline">ngrok</a> tunnel URL.
          </p>
        </div>

        <p v-if="webhookResult" class="text-xs px-3 py-2 rounded-xl border" :class="webhookResult.ok ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'">
          {{ webhookResult.ok ? '✓ ' : '✗ ' }}{{ webhookResult.message }}
        </p>

        <button class="btn-primary w-full" :disabled="registeringWebhook || !webhookSiteUrl" @click="registerWebhook">
          {{ registeringWebhook ? 'Registering…' : 'Register Webhook' }}
        </button>
      </div>

      <!-- Online Payment Accounts -->
      <div class="card p-5 sm:p-6 space-y-5">
        <div>
          <h3 class="text-sm font-semibold text-zinc-700">Online Payment Accounts</h3>
          <p class="text-xs text-zinc-400 mt-0.5">Account details shown to customers at checkout for each payment method.</p>
        </div>

        <div v-for="bank in paymentBanks" :key="bank.key" class="space-y-2">
          <p class="text-xs font-semibold text-zinc-600 uppercase tracking-wider">{{ bank.label }}</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="label">Account Number</label>
              <input v-model="form[bank.numField]" type="text" maxlength="50" class="input" :placeholder="bank.numPlaceholder" />
            </div>
            <div>
              <label class="label">Account Holder Name</label>
              <input v-model="form[bank.nameField]" type="text" maxlength="100" class="input" placeholder="e.g. Jam Supermarket" />
            </div>
          </div>
        </div>

        <button class="btn-primary w-full" :disabled="saving" @click="handleSave">
          {{ saving ? 'Saving…' : 'Save Settings' }}
        </button>
      </div>
      <!-- Danger Zone — admin only -->
      <div v-if="adminStore.user?.role === 'admin'" class="card border-red-200 p-5 sm:p-6 space-y-4">
        <div>
          <h3 class="text-sm font-semibold text-red-700">Danger Zone</h3>
          <p class="text-xs text-zinc-500 mt-0.5">Irreversible actions. Proceed with extreme caution.</p>
        </div>
        <div class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 space-y-1">
          <p class="text-xs font-semibold text-red-700">Wipe all data</p>
          <p class="text-xs text-red-600">Permanently deletes all products, categories, orders, messages, feedback, promotions, audit logs and all images from Cloudinary. This cannot be undone.</p>
        </div>
        <button class="w-full flex items-center justify-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl px-4 py-3 transition-colors" @click="wipeModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Wipe All Data
        </button>
      </div>
    </template>
  </div>

  <!-- Wipe confirmation modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="wipeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeWipeModal" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
          <!-- Header -->
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-zinc-900">Wipe all data?</h3>
              <p class="text-xs text-zinc-500 mt-0.5">This action is permanent and cannot be undone.</p>
            </div>
          </div>

          <!-- Warning list -->
          <ul class="text-xs text-zinc-600 space-y-1.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" /> All products and categories</li>
            <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" /> All orders and order history</li>
            <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" /> All messages and conversations</li>
            <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" /> All feedback, reviews and special requests</li>
            <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" /> All promotions and audit logs</li>
            <li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" /> All product and category images on Cloudinary</li>
          </ul>

          <!-- Confirmation input -->
          <div class="space-y-2">
            <p class="text-xs text-zinc-600">Type <span class="font-mono font-bold text-red-600">WIPE EVERYTHING</span> to confirm:</p>
            <input
              v-model="wipeConfirmText"
              type="text"
              class="input font-mono"
              placeholder="WIPE EVERYTHING"
              autocomplete="off"
              spellcheck="false"
            />
          </div>

          <p v-if="wipeError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{{ wipeError }}</p>

          <div class="flex gap-3">
            <button class="flex-1 btn-secondary" :disabled="wiping" @click="closeWipeModal">Cancel</button>
            <button
              class="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              :disabled="wipeConfirmText !== 'WIPE EVERYTHING' || wiping"
              @click="doWipe"
            >
              {{ wiping ? 'Wiping…' : 'Yes, wipe everything' }}
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
const adminStore = useAdminStore()
const config = useRuntimeConfig()

// Wipe state
const wipeModal = ref(false)
const wipeConfirmText = ref('')
const wiping = ref(false)
const wipeError = ref('')

function closeWipeModal() {
  wipeModal.value = false
  wipeConfirmText.value = ''
  wipeError.value = ''
}

async function doWipe() {
  wiping.value = true
  wipeError.value = ''
  try {
    await adminFetch('/api/admin/wipe', {
      method: 'POST',
      body: { confirm: wipeConfirmText.value },
    })
    closeWipeModal()
    alert('All data has been wiped successfully.')
  } catch (e) {
    wipeError.value = e?.data?.statusMessage ?? 'Wipe failed. Please try again.'
  } finally {
    wiping.value = false
  }
}

const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const error = ref('')
const togglingStore = ref(false)

async function toggleStoreStatus() {
  togglingStore.value = true
  const newValue = !form.storeIsOpen
  try {
    await adminFetch('/api/admin/settings', {
      method: 'PUT',
      body: { storeIsOpen: newValue },
    })
    form.storeIsOpen = newValue
  } catch (e) {
    error.value = e?.data?.statusMessage ?? 'Failed to update store status'
  } finally {
    togglingStore.value = false
  }
}

const botUsername = config.public.telegramBotUsername || 'jamsupermarketbot'
const webhookSiteUrl = ref('')
const registeringWebhook = ref(false)
const webhookResult = ref(null)

async function registerWebhook() {
  registeringWebhook.value = true
  webhookResult.value = null
  try {
    const res = await adminFetch('/api/admin/telegram/setup-webhook', {
      method: 'POST',
      body: { siteUrl: webhookSiteUrl.value },
    })
    webhookResult.value = { ok: true, message: `Webhook registered → ${res.webhookUrl}` }
  } catch (e) {
    webhookResult.value = { ok: false, message: e?.data?.statusMessage ?? 'Registration failed.' }
  } finally {
    registeringWebhook.value = false
  }
}

const paymentBanks = [
  { key: 'telebirr', label: 'Telebirr', numField: 'telebirrAccountNumber', nameField: 'telebirrAccountName', numPlaceholder: 'e.g. 0912345678' },
  { key: 'cbe', label: 'CBE (Commercial Bank of Ethiopia)', numField: 'cbeAccountNumber', nameField: 'cbeAccountName', numPlaceholder: 'e.g. 1000012345678' },
  { key: 'boa', label: 'BOA (Bank of Abyssinia)', numField: 'boaAccountNumber', nameField: 'boaAccountName', numPlaceholder: 'e.g. 01234567890' },
]

const form = reactive({
  storeIsOpen: true,
  minOrderAmount: 0,
  costPerKm: 0,
  serviceChargePct: 0,
  estimatedDeliveryMinutes: 45,
  telebirrAccountNumber: '',
  telebirrAccountName: '',
  cbeAccountNumber: '',
  cbeAccountName: '',
  boaAccountNumber: '',
  boaAccountName: '',
})

onMounted(async () => {
  try {
    const s = await $fetch('/api/settings')
    form.storeIsOpen = s.storeIsOpen
    form.minOrderAmount = Number(s.minOrderAmount)
    form.costPerKm = Number(s.costPerKm)
    form.serviceChargePct = Number(s.serviceChargePct)
    form.estimatedDeliveryMinutes = s.estimatedDeliveryMinutes
    form.telebirrAccountNumber = s.telebirrAccountNumber ?? ''
    form.telebirrAccountName = s.telebirrAccountName ?? ''
    form.cbeAccountNumber = s.cbeAccountNumber ?? ''
    form.cbeAccountName = s.cbeAccountName ?? ''
    form.boaAccountNumber = s.boaAccountNumber ?? ''
    form.boaAccountName = s.boaAccountName ?? ''
  } catch {
    error.value = 'Failed to load settings.'
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  saving.value = true
  saved.value = false
  error.value = ''
  try {
    await adminFetch('/api/admin/settings', {
      method: 'PUT',
      body: {
        storeIsOpen: form.storeIsOpen,
        minOrderAmount: form.minOrderAmount,
        costPerKm: form.costPerKm,
        serviceChargePct: form.serviceChargePct,
        estimatedDeliveryMinutes: form.estimatedDeliveryMinutes,
        telebirrAccountNumber: form.telebirrAccountNumber,
        telebirrAccountName: form.telebirrAccountName,
        cbeAccountNumber: form.cbeAccountNumber,
        cbeAccountName: form.cbeAccountName,
        boaAccountNumber: form.boaAccountNumber,
        boaAccountName: form.boaAccountName,
      },
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 4000)
  } catch (e) {
    error.value = e?.data?.statusMessage ?? 'Failed to save settings.'
  } finally {
    saving.value = false
  }
}

useHead({ title: 'Settings — Admin' })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
