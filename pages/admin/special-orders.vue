<template>
  <div class="space-y-4">
    <!-- Header + filters -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <h1 class="text-lg font-bold text-zinc-900">Product Requests</h1>
      <select v-model="filterStatus" class="input w-auto text-xs py-1.5 px-3">
        <option value="">All statuses</option>
        <option value="PENDING">Pending</option>
        <option value="SEEN">Seen</option>
        <option value="PROCESSING">Processing</option>
        <option value="FULFILLED">Fulfilled</option>
        <option value="REJECTED">Rejected</option>
      </select>
    </div>

    <!-- List -->
    <div v-if="loading" class="space-y-3">
      <div v-for="n in 4" :key="n" class="card h-24 animate-pulse bg-zinc-100" />
    </div>

    <div v-else-if="!filtered.length" class="card p-14 text-center text-zinc-400 text-sm">
      No product requests {{ filterStatus ? 'with this status' : 'yet' }}.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="req in filtered"
        :key="req.id"
        class="card p-4 sm:p-5 hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer"
        :class="req.status === 'PENDING' ? 'border-l-4 border-l-amber-400' : ''"
        @click="open(req)"
      >
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-1.5">
              <span class="text-sm font-bold text-zinc-900 font-mono">#{{ req.id }}</span>
              <span :class="statusBadge(req.status)">{{ statusLabel(req.status) }}</span>
              <span class="text-xs text-zinc-400">{{ formatDate(req.createdAt) }}</span>
            </div>
            <p class="text-sm font-semibold text-zinc-800">{{ req.productName }}</p>
            <p class="text-xs text-zinc-500 mt-0.5">
              {{ req.customer.firstName }} {{ req.customer.lastName ?? '' }}
              <span v-if="req.customer.username" class="text-zinc-400"> · @{{ req.customer.username }}</span>
            </p>
            <p class="text-xs text-zinc-400 mt-1">
              Qty: <span class="font-medium text-zinc-600">{{ req.quantity }}</span>
              <template v-if="req.brand"> · Brand: <span class="font-medium text-zinc-600">{{ req.brand }}</span></template>
              <template v-if="req.madeIn"> · Made in: <span class="font-medium text-zinc-600">{{ req.madeIn }}</span></template>
              <template v-if="req.size"> · Size: <span class="font-medium text-zinc-600">{{ req.size }}</span></template>
              <template v-if="req.color"> · Color: <span class="font-medium text-zinc-600">{{ req.color }}</span></template>
            </p>
          </div>
          <img v-if="req.imageUrl" :src="req.imageUrl" class="w-14 h-14 rounded-xl object-cover bg-zinc-100 shrink-0" />
        </div>
        <p v-if="req.notes" class="text-xs text-zinc-400 italic mt-2">{{ req.notes }}</p>
      </div>
    </div>

    <!-- Detail / action drawer -->
    <Transition name="sheet">
      <div v-if="active" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center" @click.self="active = null">
        <div class="absolute inset-0 bg-black/30" @click="active = null" />
        <div class="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <p class="text-xs text-zinc-400 font-mono mb-0.5">Request #{{ active.id }}</p>
              <h2 class="text-base font-bold text-zinc-900">{{ active.productName }}</h2>
            </div>
            <button class="text-zinc-400 hover:text-zinc-700 p-1" @click="active = null">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="p-5 space-y-4">
            <!-- Customer -->
            <div class="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
              <div class="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
                {{ active.customer.firstName[0] }}
              </div>
              <div>
                <p class="text-sm font-semibold text-zinc-800">{{ active.customer.firstName }} {{ active.customer.lastName ?? '' }}</p>
                <p class="text-xs text-zinc-400">
                  <template v-if="active.customer.username">@{{ active.customer.username }} · </template>
                  {{ active.customer.phone ?? 'No phone' }}
                </p>
              </div>
            </div>

            <!-- Image -->
            <img v-if="active.imageUrl" :src="active.imageUrl" class="w-full h-52 object-cover rounded-xl bg-zinc-100" />

            <!-- Details -->
            <dl class="space-y-2 text-sm">
              <div class="flex gap-2"><dt class="text-zinc-400 w-28 shrink-0">Quantity</dt><dd class="font-medium text-zinc-800">{{ active.quantity }}</dd></div>
              <div v-if="active.brand" class="flex gap-2"><dt class="text-zinc-400 w-28 shrink-0">Brand</dt><dd class="font-medium text-zinc-800">{{ active.brand }}</dd></div>
              <div v-if="active.madeIn" class="flex gap-2"><dt class="text-zinc-400 w-28 shrink-0">Made in</dt><dd class="font-medium text-zinc-800">{{ active.madeIn }}</dd></div>
              <div v-if="active.size" class="flex gap-2"><dt class="text-zinc-400 w-28 shrink-0">Size / Weight</dt><dd class="font-medium text-zinc-800">{{ active.size }}</dd></div>
              <div v-if="active.color" class="flex gap-2"><dt class="text-zinc-400 w-28 shrink-0">Color</dt><dd class="font-medium text-zinc-800">{{ active.color }}</dd></div>
              <div v-if="active.notes" class="flex gap-2"><dt class="text-zinc-400 w-28 shrink-0">Notes</dt><dd class="text-zinc-700">{{ active.notes }}</dd></div>
              <div class="flex gap-2"><dt class="text-zinc-400 w-28 shrink-0">Submitted</dt><dd class="text-zinc-500">{{ formatDate(active.createdAt) }}</dd></div>
              <div class="flex gap-2"><dt class="text-zinc-400 w-28 shrink-0">Status</dt><dd><span :class="statusBadge(active.status)">{{ statusLabel(active.status) }}</span></dd></div>
            </dl>

            <!-- Status actions -->
            <div class="divider" />
            <div>
              <p class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Update Status</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="s in ['SEEN', 'PROCESSING', 'FULFILLED', 'REJECTED']"
                  :key="s"
                  class="text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all"
                  :class="active.status === s
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'"
                  :disabled="updating"
                  @click="updateStatus(s)"
                >
                  {{ statusLabel(s) }}
                </button>
              </div>
            </div>

            <!-- Admin notes -->
            <div>
              <label class="label">Reply to customer <span class="text-zinc-400 normal-case font-normal">(optional)</span></label>
              <textarea v-model="adminNotes" class="input resize-none" rows="3" placeholder="e.g. We found this item, price is ETB 450, available in 3 days…" />
            </div>

            <div class="flex gap-3">
              <button class="btn-secondary flex-1" @click="active = null">Close</button>
              <button class="btn-primary flex-1" :disabled="updating" @click="saveNotes">
                {{ updating ? 'Saving…' : 'Save Reply' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const { adminFetch } = useAdminFetch()

const requests = ref([])
const loading = ref(true)
const filterStatus = ref('')
const active = ref(null)
const adminNotes = ref('')
const updating = ref(false)

const STATUS = {
  PENDING:    { label: 'Pending',    cls: 'badge badge-yellow' },
  SEEN:       { label: 'Seen',       cls: 'badge badge-blue' },
  PROCESSING: { label: 'Processing', cls: 'badge badge-orange' },
  FULFILLED:  { label: 'Fulfilled',  cls: 'badge badge-green' },
  REJECTED:   { label: 'Rejected',   cls: 'badge badge-red' },
}
function statusLabel(s) { return STATUS[s]?.label ?? s }
function statusBadge(s) { return STATUS[s]?.cls ?? 'badge' }

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const filtered = computed(() =>
  filterStatus.value ? requests.value.filter(r => r.status === filterStatus.value) : requests.value
)

async function fetchRequests() {
  loading.value = true
  try {
    requests.value = await adminFetch('/api/admin/special-orders')
  } catch {}
  finally { loading.value = false }
}

function open(req) {
  active.value = req
  adminNotes.value = req.adminNotes ?? ''
  if (req.status === 'PENDING') updateStatus('SEEN', false)
}

async function updateStatus(status, closeOnDone = true) {
  updating.value = true
  try {
    const updated = await adminFetch(`/api/admin/special-orders/${active.value.id}`, {
      method: 'PATCH',
      body: { status },
    })
    const idx = requests.value.findIndex(r => r.id === updated.id)
    if (idx !== -1) requests.value[idx] = { ...requests.value[idx], ...updated }
    if (active.value) active.value = { ...active.value, status: updated.status }
  } catch {}
  finally { updating.value = false }
}

async function saveNotes() {
  updating.value = true
  try {
    const updated = await adminFetch(`/api/admin/special-orders/${active.value.id}`, {
      method: 'PATCH',
      body: { adminNotes: adminNotes.value },
    })
    const idx = requests.value.findIndex(r => r.id === updated.id)
    if (idx !== -1) requests.value[idx] = { ...requests.value[idx], ...updated }
    if (active.value) active.value = { ...active.value, adminNotes: updated.adminNotes }
    active.value = null
  } catch {}
  finally { updating.value = false }
}

onMounted(fetchRequests)
useHead({ title: 'Product Requests — Admin' })
</script>

<style scoped>
.sheet-enter-active, .sheet-leave-active { transition: opacity 0.2s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
</style>
