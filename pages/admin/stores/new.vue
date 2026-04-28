<template>
  <div class="max-w-lg space-y-6">
    <div class="flex items-center gap-3">
      <NuxtLink to="/admin/stores" class="text-zinc-400 hover:text-zinc-700 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <div>
        <h2 class="text-lg font-bold text-zinc-900">Add Store</h2>
        <p class="text-sm text-zinc-400 mt-0.5">Set the store's name, location, and delivery rates.</p>
      </div>
    </div>

    <div class="card p-5 sm:p-6 space-y-5">
      <div>
        <label class="label">Store name *</label>
        <input v-model="form.name" type="text" class="input" placeholder="e.g. Jam Supermarket – Bole" />
      </div>

      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-zinc-700">Active</p>
          <p class="text-xs text-zinc-400 mt-0.5">Customers can order from this store when active.</p>
        </div>
        <button
          type="button"
          class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none"
          :class="form.isActive ? 'bg-brand-500' : 'bg-zinc-200'"
          @click="form.isActive = !form.isActive"
        >
          <span
            class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
            :class="form.isActive ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>

      <div>
        <label class="label">
          Store location *
          <span v-if="location.address" class="text-brand-500 font-normal normal-case tracking-normal text-xs ml-1">✓ location set</span>
        </label>
        <MapPicker
          :model-value="location"
          placeholder="Drop the pin on the store's location"
          @update:model-value="Object.assign(location, $event)"
        />
      </div>

      <div>
        <label class="label">Delivery rates <span class="text-zinc-400 font-normal normal-case tracking-normal">(leave blank to use global defaults)</span></label>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label text-xs">Cost per km (ETB)</label>
            <input v-model="costPerKmInput" type="number" min="0" step="0.01" class="input" placeholder="e.g. 15" />
          </div>
          <div>
            <label class="label text-xs">Service charge (%)</label>
            <input v-model="serviceChargePctInput" type="number" min="0" max="100" step="0.01" class="input" placeholder="e.g. 5" />
          </div>
        </div>
      </div>

      <p v-if="error" class="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{{ error }}</p>

      <button
        class="btn-primary w-full"
        :disabled="saving || !form.name"
        @click="handleSave"
      >
        {{ saving ? 'Saving…' : 'Add Store' }}
      </button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const { adminFetch } = useAdminFetch()
const router = useRouter()

const location = reactive({ lat: null, lng: null, address: '' })

const form = reactive({
  name: '',
  isActive: true,
})

const costPerKmInput = ref('')
const serviceChargePctInput = ref('')
const saving = ref(false)
const error = ref('')

async function handleSave() {
  saving.value = true
  error.value = ''
  try {
    await adminFetch('/api/admin/stores', {
      method: 'POST',
      body: {
        name: form.name,
        address: location.address,
        lat: location.lat,
        lng: location.lng,
        isActive: form.isActive,
        costPerKm: costPerKmInput.value !== '' ? Number(costPerKmInput.value) : null,
        serviceChargePct: serviceChargePctInput.value !== '' ? Number(serviceChargePctInput.value) : null,
      },
    })
    router.push('/admin/stores')
  } catch (e) {
    error.value = e?.data?.statusMessage ?? 'Failed to save store.'
  } finally {
    saving.value = false
  }
}

useHead({ title: 'Add Store — Admin' })
</script>
