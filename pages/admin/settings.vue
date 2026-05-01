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
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-zinc-700">Store status</p>
            <p class="text-xs text-zinc-400 mt-0.5">Customers cannot order while closed.</p>
          </div>
          <button
            type="button"
            class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none"
            :class="form.storeIsOpen ? 'bg-brand-500' : 'bg-zinc-200'"
            @click="form.storeIsOpen = !form.storeIsOpen"
          >
            <span
              class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
              :class="form.storeIsOpen ? 'translate-x-5' : 'translate-x-0'"
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
    </template>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const { adminFetch } = useAdminFetch()

const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const error = ref('')

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
