<template>
  <div class="max-w-2xl mx-auto space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-zinc-900">Product Requests</h1>
        <p class="text-xs text-zinc-400 mt-0.5">Can't find something? Request it and we'll source it for you.</p>
      </div>
      <button class="btn-primary text-xs px-3 py-2" @click="showForm = true">
        + New Request
      </button>
    </div>

    <!-- Request list -->
    <div v-if="loading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="card h-20 animate-pulse bg-zinc-100" />
    </div>

    <div v-else-if="!requests.length" class="card p-12 text-center">
      <div class="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
        </svg>
      </div>
      <p class="text-sm font-semibold text-zinc-700">No requests yet</p>
      <p class="text-xs text-zinc-400 mt-1">Request a product and we'll try to source it for you.</p>
      <button class="btn-primary text-xs px-4 py-2 mt-4" @click="showForm = true">Make your first request</button>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="req in requests"
        :key="req.id"
        class="card p-4 hover:border-zinc-300 transition-all cursor-pointer"
        @click="selected = req"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <span class="text-sm font-semibold text-zinc-900 truncate">{{ req.productName }}</span>
              <span :class="statusBadge(req.status)">{{ statusLabel(req.status) }}</span>
            </div>
            <p class="text-xs text-zinc-400">
              Qty: {{ req.quantity }}
              <template v-if="req.brand"> · {{ req.brand }}</template>
              <template v-if="req.size"> · {{ req.size }}</template>
              <template v-if="req.color"> · {{ req.color }}</template>
            </p>
            <p class="text-xs text-zinc-300 mt-0.5">{{ formatDate(req.createdAt) }}</p>
          </div>
          <img
            v-if="req.imageUrl"
            :src="req.imageUrl"
            class="w-12 h-12 rounded-xl object-cover shrink-0 bg-zinc-100"
          />
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-300 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <div v-if="req.adminNotes" class="mt-2 pt-2 border-t border-zinc-100">
          <p class="text-xs text-zinc-500"><span class="font-semibold">Store reply:</span> {{ req.adminNotes }}</p>
        </div>
      </div>
    </div>

    <!-- Detail modal -->
    <Transition name="sheet">
      <div v-if="selected" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center" @click.self="selected = null">
        <div class="absolute inset-0 bg-black/30" @click="selected = null" />
        <div class="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-3 shadow-xl max-h-[85vh] overflow-y-auto">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-base font-bold text-zinc-900">{{ selected.productName }}</h2>
              <span :class="statusBadge(selected.status)">{{ statusLabel(selected.status) }}</span>
            </div>
            <button class="text-zinc-400 hover:text-zinc-700 p-1" @click="selected = null">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <img v-if="selected.imageUrl" :src="selected.imageUrl" class="w-full h-48 object-cover rounded-xl bg-zinc-100" />
          <dl class="space-y-1.5 text-sm">
            <div class="flex gap-2"><dt class="text-zinc-400 w-28 shrink-0">Quantity</dt><dd class="font-medium text-zinc-800">{{ selected.quantity }}</dd></div>
            <div v-if="selected.brand" class="flex gap-2"><dt class="text-zinc-400 w-28 shrink-0">Brand</dt><dd class="font-medium text-zinc-800">{{ selected.brand }}</dd></div>
            <div v-if="selected.madeIn" class="flex gap-2"><dt class="text-zinc-400 w-28 shrink-0">Made in</dt><dd class="font-medium text-zinc-800">{{ selected.madeIn }}</dd></div>
            <div v-if="selected.size" class="flex gap-2"><dt class="text-zinc-400 w-28 shrink-0">Size</dt><dd class="font-medium text-zinc-800">{{ selected.size }}</dd></div>
            <div v-if="selected.color" class="flex gap-2"><dt class="text-zinc-400 w-28 shrink-0">Color</dt><dd class="font-medium text-zinc-800">{{ selected.color }}</dd></div>
            <div v-if="selected.notes" class="flex gap-2"><dt class="text-zinc-400 w-28 shrink-0">Notes</dt><dd class="font-medium text-zinc-800">{{ selected.notes }}</dd></div>
            <div class="flex gap-2"><dt class="text-zinc-400 w-28 shrink-0">Submitted</dt><dd class="text-zinc-500">{{ formatDate(selected.createdAt) }}</dd></div>
          </dl>
          <div v-if="selected.adminNotes" class="rounded-xl bg-forest-50 border border-forest-200 p-3">
            <p class="text-xs font-semibold text-forest-700 mb-1">Reply from Jam Store</p>
            <p class="text-sm text-forest-800">{{ selected.adminNotes }}</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- New request form -->
    <Transition name="sheet">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center" @click.self="closeForm">
        <div class="absolute inset-0 bg-black/30" @click="closeForm" />
        <div class="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto">
          <div class="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-zinc-100 flex items-center justify-between">
            <h2 class="text-base font-bold text-zinc-900">Request a Product</h2>
            <button class="text-zinc-400 hover:text-zinc-700 p-1" @click="closeForm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="p-5 space-y-4">
            <!-- Product name -->
            <div>
              <label class="label">Product name <span class="text-brand-500">*</span></label>
              <input v-model="form.productName" class="input" placeholder="e.g. Basmati Rice 5kg" maxlength="200" />
            </div>

            <!-- Quantity -->
            <div>
              <label class="label">How many? <span class="text-brand-500">*</span></label>
              <input v-model.number="form.quantity" type="number" min="1" class="input" placeholder="1" />
            </div>

            <!-- Row: brand + made in -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">Brand <span class="text-zinc-400 normal-case font-normal">(optional)</span></label>
                <input v-model="form.brand" class="input" placeholder="e.g. Tilda" maxlength="100" />
              </div>
              <div>
                <label class="label">Made in <span class="text-zinc-400 normal-case font-normal">(optional)</span></label>
                <input v-model="form.madeIn" class="input" placeholder="e.g. India" maxlength="100" />
              </div>
            </div>

            <!-- Row: size + color -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">Size / Weight <span class="text-zinc-400 normal-case font-normal">(optional)</span></label>
                <input v-model="form.size" class="input" placeholder="e.g. 500g, XL" maxlength="100" />
              </div>
              <div>
                <label class="label">Color <span class="text-zinc-400 normal-case font-normal">(optional)</span></label>
                <input v-model="form.color" class="input" placeholder="e.g. Red" maxlength="100" />
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="label">Additional notes <span class="text-zinc-400 normal-case font-normal">(optional)</span></label>
              <textarea v-model="form.notes" class="input resize-none" rows="3" placeholder="Any extra details that might help us find it…" maxlength="1000" />
            </div>

            <!-- Image upload -->
            <div>
              <label class="label">Reference image <span class="text-zinc-400 normal-case font-normal">(optional)</span></label>
              <div v-if="form.imageUrl" class="relative w-24 h-24">
                <img :src="form.imageUrl" class="w-24 h-24 object-cover rounded-xl bg-zinc-100" />
                <button class="absolute -top-1.5 -right-1.5 bg-white border border-zinc-200 rounded-full p-0.5 shadow" @click="form.imageUrl = ''">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <label v-else class="flex items-center gap-2 w-fit cursor-pointer">
                <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" @change="uploadImage" />
                <span class="btn-secondary text-xs px-3 py-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  {{ uploading ? 'Uploading…' : 'Attach image' }}
                </span>
              </label>
            </div>

            <p v-if="error" class="text-xs text-brand-600 font-medium">{{ error }}</p>

            <div class="flex gap-3 pt-1">
              <button class="btn-secondary flex-1" @click="closeForm">Cancel</button>
              <button class="btn-primary flex-1" :disabled="submitting || uploading" @click="submit">
                {{ submitting ? 'Sending…' : 'Send Request' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth'], ssr: false })

const customerStore = useCustomerStore()

const requests = ref([])
const loading = ref(true)
const showForm = ref(false)
const selected = ref(null)
const submitting = ref(false)
const uploading = ref(false)
const error = ref('')

const form = ref({ productName: '', quantity: 1, brand: '', madeIn: '', size: '', color: '', notes: '', imageUrl: '' })

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

async function fetchRequests() {
  loading.value = true
  try {
    const data = await $fetch('/api/customer/special-orders', {
      headers: { Authorization: `Bearer ${customerStore.token}` },
    })
    requests.value = data
  } catch {}
  finally { loading.value = false }
}

async function uploadImage(e) {
  const file = e.target.files[0]
  if (!file) return
  uploading.value = true
  error.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch('/api/customer/special-orders/upload', {
      method: 'POST',
      body: fd,
      headers: { Authorization: `Bearer ${customerStore.token}` },
    })
    form.value.imageUrl = res.imageUrl
  } catch (e) {
    error.value = e?.data?.statusMessage ?? 'Upload failed'
  } finally { uploading.value = false }
}

async function submit() {
  error.value = ''
  if (!form.value.productName.trim()) { error.value = 'Product name is required'; return }
  if (!form.value.quantity || form.value.quantity < 1) { error.value = 'Quantity must be at least 1'; return }
  submitting.value = true
  try {
    const res = await $fetch('/api/customer/special-orders', {
      method: 'POST',
      body: form.value,
      headers: { Authorization: `Bearer ${customerStore.token}` },
    })
    requests.value.unshift(res)
    closeForm()
  } catch (e) {
    error.value = e?.data?.statusMessage ?? 'Failed to submit request'
  } finally { submitting.value = false }
}

function closeForm() {
  showForm.value = false
  form.value = { productName: '', quantity: 1, brand: '', madeIn: '', size: '', color: '', notes: '', imageUrl: '' }
  error.value = ''
}

onMounted(fetchRequests)
useHead({ title: 'Product Requests — Jam Store' })
</script>

<style scoped>
.sheet-enter-active, .sheet-leave-active { transition: opacity 0.2s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
</style>
