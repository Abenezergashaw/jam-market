<template>
  <div class="max-w-lg space-y-6">
    <div>
      <h2 class="text-lg font-bold text-zinc-900">Store Settings</h2>
      <p class="text-sm text-zinc-400 mt-0.5">Configure delivery fees, store hours, and location.</p>
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
            <label class="label">Cost per km (ETB)</label>
            <input v-model.number="form.costPerKm" type="number" min="0" step="0.01" class="input" />
          </div>
          <div>
            <label class="label">Service charge (%)</label>
            <input v-model.number="form.serviceChargePct" type="number" min="0" max="100" step="0.01" class="input" />
          </div>
        </div>

        <!-- Store location -->
        <div>
          <label class="label">Store coordinates <span class="text-zinc-400 font-normal normal-case tracking-normal">(delivery origin)</span></label>
          <div class="grid grid-cols-2 gap-3">
            <input v-model.number="form.storeLat" type="number" step="any" class="input" placeholder="Lat e.g. 9.0054" />
            <input v-model.number="form.storeLng" type="number" step="any" class="input" placeholder="Lng e.g. 38.7636" />
          </div>
          <p class="text-xs text-zinc-400 mt-1.5">Leave blank to disable distance-based delivery fee.</p>
        </div>

        <p v-if="error" class="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{{ error }}</p>
        <p v-if="saved" class="text-xs text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2">Settings saved successfully.</p>

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

const form = reactive({
  storeIsOpen: true,
  minOrderAmount: 0,
  costPerKm: 0,
  serviceChargePct: 0,
  storeLat: null,
  storeLng: null,
  estimatedDeliveryMinutes: 45,
})

onMounted(async () => {
  try {
    const s = await $fetch('/api/settings')
    form.storeIsOpen = s.storeIsOpen
    form.minOrderAmount = Number(s.minOrderAmount)
    form.costPerKm = Number(s.costPerKm)
    form.serviceChargePct = Number(s.serviceChargePct)
    form.storeLat = s.storeLat != null ? Number(s.storeLat) : null
    form.storeLng = s.storeLng != null ? Number(s.storeLng) : null
    form.estimatedDeliveryMinutes = s.estimatedDeliveryMinutes
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
        storeLat: Number.isFinite(form.storeLat) ? form.storeLat : null,
        storeLng: Number.isFinite(form.storeLng) ? form.storeLng : null,
        estimatedDeliveryMinutes: form.estimatedDeliveryMinutes,
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
