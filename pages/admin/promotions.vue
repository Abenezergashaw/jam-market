<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <p class="text-xs text-zinc-500 font-medium">{{ promotions.length }} promotion{{ promotions.length === 1 ? '' : 's' }}</p>
      <button class="btn-primary text-xs py-2 px-4" @click="openCreate">+ Add promotion</button>
    </div>

    <div v-if="loading" class="card p-8 text-center text-zinc-400 text-sm animate-pulse">Loading...</div>

    <div v-else-if="!promotions.length" class="card p-14 text-center">
      <p class="text-4xl mb-3">🎁</p>
      <p class="text-zinc-400 text-sm mb-3">No promotions yet.</p>
      <button class="text-brand-500 hover:text-brand-600 text-sm font-semibold transition-colors" @click="openCreate">Create the first one →</button>
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[640px]">
          <thead class="border-b border-zinc-100">
            <tr>
              <th class="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Promotion</th>
              <th class="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Type</th>
              <th class="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Period</th>
              <th class="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100">
            <tr v-for="promo in promotions" :key="promo.id" class="hover:bg-zinc-50 transition-colors">
              <td class="px-4 py-3">
                <p class="font-medium text-zinc-900">{{ promo.name }}</p>
                <p v-if="promo.description" class="text-xs text-zinc-400 mt-0.5">{{ promo.description }}</p>
                <p v-if="Number(promo.minOrderAmount) > 0" class="text-xs text-zinc-400 mt-0.5">Min order: ETB {{ Number(promo.minOrderAmount).toFixed(2) }}</p>
              </td>
              <td class="px-4 py-3">
                <span class="text-xs font-semibold px-2 py-1 rounded-lg" :class="typeClass(promo.type)">{{ typeLabel(promo) }}</span>
              </td>
              <td class="px-4 py-3 text-xs text-zinc-500">
                <p>{{ formatDate(promo.startAt) }}</p>
                <p class="text-zinc-300">→ {{ formatDate(promo.endAt) }}</p>
              </td>
              <td class="px-4 py-3">
                <span v-if="isLive(promo)" class="badge badge-green">Live</span>
                <span v-else-if="isUpcoming(promo)" class="badge badge-yellow">Upcoming</span>
                <span v-else-if="!promo.isActive" class="badge badge-zinc">Disabled</span>
                <span v-else class="badge badge-zinc">Ended</span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-3">
                  <button class="text-xs text-brand-500 hover:text-brand-600 transition-colors font-medium" @click="openEdit(promo)">Edit</button>
                  <button class="text-xs text-zinc-400 hover:text-red-500 transition-colors" @click="deletePromo(promo)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="closeModal">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <h2 class="font-bold text-zinc-900">{{ editing ? 'Edit Promotion' : 'New Promotion' }}</h2>
            <button class="text-zinc-400 hover:text-zinc-700 transition-colors" @click="closeModal">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label class="label">Promotion name</label>
              <input v-model="form.name" class="input" placeholder="e.g. Free Delivery Weekend" />
            </div>
            <div>
              <label class="label">Description <span class="text-zinc-400 font-normal">(shown to customers)</span></label>
              <input v-model="form.description" class="input" placeholder="e.g. Free delivery on all orders this weekend!" />
            </div>
            <div>
              <label class="label">Type</label>
              <select v-model="form.type" class="input">
                <option value="FREE_DELIVERY">Free Delivery</option>
                <option value="PERCENT_OFF">Percentage Discount</option>
                <option value="FLAT_OFF">Flat Amount Off</option>
              </select>
            </div>
            <div v-if="form.type !== 'FREE_DELIVERY'" class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">{{ form.type === 'PERCENT_OFF' ? 'Discount %' : 'Amount off (ETB)' }}</label>
                <input v-model.number="form.value" type="number" min="0" class="input" placeholder="0" />
              </div>
              <div v-if="form.type === 'PERCENT_OFF'">
                <label class="label">Max discount (ETB) <span class="text-zinc-400 font-normal">optional</span></label>
                <input v-model.number="form.maxDiscount" type="number" min="0" class="input" placeholder="No cap" />
              </div>
            </div>
            <div>
              <label class="label">Minimum order amount (ETB) <span class="text-zinc-400 font-normal">optional</span></label>
              <input v-model.number="form.minOrderAmount" type="number" min="0" class="input" placeholder="0 = no minimum" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">Start date & time</label>
                <input v-model="form.startAt" type="datetime-local" class="input" />
              </div>
              <div>
                <label class="label">End date & time</label>
                <input v-model="form.endAt" type="datetime-local" class="input" />
              </div>
            </div>
            <div class="flex items-center gap-3">
              <input id="isActive" v-model="form.isActive" type="checkbox" class="w-4 h-4 accent-brand-500 rounded" />
              <label for="isActive" class="text-sm text-zinc-700">Active (visible to customers)</label>
            </div>
            <p v-if="modalError" class="text-sm text-red-500">{{ modalError }}</p>
          </div>

          <div class="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
            <button class="btn-secondary text-sm" @click="closeModal">Cancel</button>
            <button class="btn-primary text-sm" :disabled="saving" @click="save">{{ saving ? 'Saving…' : (editing ? 'Save changes' : 'Create promotion') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const { adminFetch } = useAdminFetch()
const loading = ref(true)
const promotions = ref([])
const showModal = ref(false)
const editing = ref(null)
const saving = ref(false)
const modalError = ref('')

const defaultForm = () => ({
  name: '',
  description: '',
  type: 'FREE_DELIVERY',
  value: 0,
  minOrderAmount: 0,
  maxDiscount: null,
  startAt: '',
  endAt: '',
  isActive: true,
})

const form = reactive(defaultForm())

async function load() {
  loading.value = true
  try {
    promotions.value = await adminFetch('/api/admin/promotions')
  } finally {
    loading.value = false
  }
}

onMounted(load)

function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function openCreate() {
  editing.value = null
  Object.assign(form, defaultForm())
  modalError.value = ''
  showModal.value = true
}

function openEdit(promo) {
  editing.value = promo
  Object.assign(form, {
    name: promo.name,
    description: promo.description ?? '',
    type: promo.type,
    value: Number(promo.value),
    minOrderAmount: Number(promo.minOrderAmount),
    maxDiscount: promo.maxDiscount != null ? Number(promo.maxDiscount) : null,
    startAt: toLocalInput(promo.startAt),
    endAt: toLocalInput(promo.endAt),
    isActive: promo.isActive,
  })
  modalError.value = ''
  showModal.value = true
}

function closeModal() { showModal.value = false }

async function save() {
  if (!form.name.trim()) { modalError.value = 'Name is required'; return }
  if (!form.startAt || !form.endAt) { modalError.value = 'Start and end dates are required'; return }
  if (new Date(form.startAt) >= new Date(form.endAt)) { modalError.value = 'End date must be after start date'; return }

  saving.value = true
  modalError.value = ''
  try {
    const body = {
      name: form.name,
      description: form.description,
      type: form.type,
      value: form.type === 'FREE_DELIVERY' ? 0 : (form.value || 0),
      minOrderAmount: form.minOrderAmount || 0,
      maxDiscount: form.type === 'PERCENT_OFF' && form.maxDiscount ? form.maxDiscount : null,
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      isActive: form.isActive,
    }
    if (editing.value) {
      const updated = await adminFetch(`/api/admin/promotions/${editing.value.id}`, { method: 'PUT', body })
      const idx = promotions.value.findIndex(p => p.id === editing.value.id)
      if (idx !== -1) promotions.value[idx] = updated
    } else {
      const created = await adminFetch('/api/admin/promotions', { method: 'POST', body })
      promotions.value.unshift(created)
    }
    closeModal()
  } catch (e) {
    modalError.value = e?.data?.statusMessage ?? 'Failed to save'
  } finally {
    saving.value = false
  }
}

async function deletePromo(promo) {
  if (!confirm(`Delete "${promo.name}"? This cannot be undone.`)) return
  try {
    await adminFetch(`/api/admin/promotions/${promo.id}`, { method: 'DELETE' })
    promotions.value = promotions.value.filter(p => p.id !== promo.id)
  } catch (e) {
    alert(e?.data?.statusMessage ?? 'Failed to delete')
  }
}

function isLive(promo) {
  if (!promo.isActive) return false
  const now = new Date()
  return new Date(promo.startAt) <= now && new Date(promo.endAt) >= now
}

function isUpcoming(promo) {
  if (!promo.isActive) return false
  return new Date(promo.startAt) > new Date()
}

function typeLabel(promo) {
  if (promo.type === 'FREE_DELIVERY') return '🚚 Free Delivery'
  if (promo.type === 'PERCENT_OFF') return `${Number(promo.value).toFixed(0)}% Off`
  return `ETB ${Number(promo.value).toFixed(0)} Off`
}

function typeClass(type) {
  if (type === 'FREE_DELIVERY') return 'bg-blue-50 text-blue-600'
  if (type === 'PERCENT_OFF') return 'bg-purple-50 text-purple-600'
  return 'bg-orange-50 text-orange-600'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

useHead({ title: 'Promotions — Admin' })
</script>
