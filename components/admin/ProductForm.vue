<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">

    <!-- Basic Info -->
    <div class="space-y-4">
      <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Basic Info</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label">Product name *</label>
          <input v-model="form.name" type="text" class="input" placeholder="e.g. Organic Bananas" required />
        </div>
        <div>
          <label class="label">Price ($) *</label>
          <input v-model="form.price" type="number" step="0.01" min="0.01" class="input" placeholder="2.99" required />
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label">SKU <span class="text-zinc-400 font-normal">(optional — used for import deduplication)</span></label>
          <input v-model="form.sku" type="text" class="input" placeholder="e.g. SKU-001, COCONUT-500ML" />
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label">Brand <span class="text-zinc-400 font-normal">(optional)</span></label>
          <input v-model="form.brand" type="text" class="input" placeholder="e.g. Dole, Nestlé" />
        </div>
        <div>
          <label class="label">Category</label>
          <select v-model="form.categoryId" class="input">
            <option :value="null">Uncategorized</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
      </div>
      <div>
        <label class="label">Description <span class="text-zinc-400 font-normal">(optional)</span></label>
        <textarea v-model="form.description" class="input resize-none" rows="3" placeholder="Short product description..." />
      </div>
    </div>

    <div class="border-t border-zinc-200" />

    <!-- Inventory -->
    <div class="space-y-4">
      <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Inventory</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label class="label">Stock *</label>
          <input v-model="form.stock" type="number" min="0" class="input" placeholder="0" />
        </div>
        <div>
          <label class="label">Low stock alert at</label>
          <input v-model="form.lowStockThreshold" type="number" min="0" class="input" placeholder="10" />
        </div>
        <div>
          <label class="label">Unit <span class="text-zinc-400 font-normal">(optional)</span></label>
          <input v-model="form.unit" type="text" class="input" placeholder="e.g. per kg, each" />
        </div>
        <div>
          <label class="label">Weight / Volume <span class="text-zinc-400 font-normal">(optional)</span></label>
          <input v-model="form.weight" type="text" class="input" placeholder="e.g. 500g, 1L" />
        </div>
      </div>
    </div>

    <div class="border-t border-zinc-200" />

    <!-- Product Details -->
    <div class="space-y-4">
      <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Product Details</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label">Country of origin <span class="text-zinc-400 font-normal">(optional)</span></label>
          <input v-model="form.countryOfOrigin" type="text" class="input" placeholder="e.g. Kenya, USA" />
        </div>
        <div>
          <label class="label">Storage instructions <span class="text-zinc-400 font-normal">(optional)</span></label>
          <input v-model="form.storageInstructions" type="text" class="input" placeholder="e.g. Keep refrigerated" />
        </div>
      </div>
    </div>

    <div class="border-t border-zinc-200" />

    <!-- Store Locations (per branch) -->
    <div class="space-y-4">
      <div>
        <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Store Locations</h3>
        <p class="text-xs text-zinc-400 mt-1">Set the aisle and shelf for each branch. Shown on the "Find a Product" page.</p>
      </div>
      <div v-if="loadingStores" class="text-xs text-zinc-400">Loading stores…</div>
      <div v-else-if="!stores.length" class="text-xs text-zinc-400">No stores found.</div>
      <div v-else class="space-y-3">
        <div v-for="store in stores" :key="store.id" class="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 space-y-2">
          <p class="text-xs font-semibold text-zinc-700">{{ store.name }}</p>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label text-[10px]">Aisle</label>
              <input v-model="locationMap[store.id].aisle" type="text" class="input text-sm py-2" placeholder="e.g. A3" />
            </div>
            <div>
              <label class="label text-[10px]">Shelf</label>
              <input v-model="locationMap[store.id].shelf" type="text" class="input text-sm py-2" placeholder="e.g. Top" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-zinc-200" />

    <!-- Admin Only -->
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Admin Only</h3>
        <span class="badge badge-yellow text-[9px] px-1.5 py-0.5">Not shown to customers</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-if="showCostPrice">
          <label class="label">Cost price ($) <span class="text-zinc-400 font-normal">(optional)</span></label>
          <input v-model="form.costPrice" type="number" step="0.01" min="0.01" class="input" placeholder="Purchase price" />
        </div>
        <div>
          <label class="label">Expiry date <span class="text-zinc-400 font-normal">(optional)</span></label>
          <input v-model="form.expiryDate" type="date" class="input" />
        </div>
      </div>
    </div>

    <div class="border-t border-zinc-200" />

    <!-- Visibility -->
    <div class="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200">
      <div>
        <p class="text-sm font-medium text-zinc-800">Featured product</p>
        <p class="text-xs text-zinc-500 mt-0.5">Shows in the Featured section on the homepage</p>
      </div>
      <button
        type="button"
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0"
        :class="form.isFeatured ? 'bg-brand-500' : 'bg-zinc-300'"
        @click="form.isFeatured = !form.isFeatured"
      >
        <span
          class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform"
          :class="form.isFeatured ? 'translate-x-6' : 'translate-x-1'"
        />
      </button>
    </div>

    <div class="border-t border-zinc-200" />

    <!-- Images -->
    <div class="space-y-4">
      <div>
        <h3 class="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Images</h3>
        <p class="text-xs text-zinc-400 mt-1">First image is the primary (shown in listings). Click any image to set it as primary.</p>
      </div>

      <!-- Image grid -->
      <div v-if="allImages.length" class="grid grid-cols-3 sm:grid-cols-4 gap-2">
        <div
          v-for="(img, idx) in allImages"
          :key="img"
          class="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 border-2 transition-all group cursor-pointer"
          :class="idx === 0 ? 'border-brand-500 ring-2 ring-brand-300' : 'border-zinc-200'"
          @click="setPrimary(idx)"
        >
          <ProductImage :src="img" class="w-full h-full object-cover" />

          <!-- Primary badge -->
          <div v-if="idx === 0" class="absolute top-1 left-1 bg-brand-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
            Primary
          </div>

          <!-- Actions overlay -->
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity">
            <span v-if="idx !== 0" class="text-[10px] text-white font-semibold bg-brand-500 px-2 py-0.5 rounded-full">Set primary</span>
            <button
              type="button"
              class="p-1.5 bg-white/20 hover:bg-red-500 rounded-lg transition-colors"
              @click.stop="removeImage(idx)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Upload area -->
      <div
        class="relative border-2 border-dashed border-zinc-200 rounded-xl p-6 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-colors cursor-pointer"
        @click="fileInput?.click()"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="handleFiles"
        />
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-sm text-zinc-500 font-medium">Click to upload or drag & drop</p>
        <p class="text-xs text-zinc-400 mt-1">Select multiple images at once · JPEG, PNG, WebP</p>
        <div v-if="uploading" class="mt-3 flex items-center justify-center gap-2 text-xs text-brand-600">
          <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Uploading {{ uploadProgress }}…
        </div>
      </div>

      <!-- Paste URL -->
      <div class="flex gap-2">
        <input
          v-model="newImageUrl"
          type="text"
          class="input text-sm flex-1"
          placeholder="Or paste an image URL…"
          @keydown.enter.prevent="addImageUrl"
        />
        <button type="button" class="btn-secondary text-sm py-2.5 shrink-0" @click="addImageUrl">Add</button>
      </div>
    </div>

    <!-- Reason for change — edit only -->
    <div v-if="isEdit" class="border-t border-zinc-200 pt-5">
      <label class="label">Reason for change <span class="text-brand-500">*</span></label>
      <textarea
        v-model="form.reason"
        class="input resize-none"
        rows="2"
        maxlength="300"
        placeholder="e.g. Price corrected after new supplier invoice, added expiry date, fixed typo in description…"
        required
      />
      <p class="text-xs text-zinc-400 mt-1.5">Required — shown in the audit log so the team knows why this was changed.</p>
    </div>

    <p v-if="error" class="text-sm text-brand-700 bg-brand-50 border border-brand-200 rounded-xl px-3 py-2">{{ error }}</p>

    <div class="flex gap-3 pt-1">
      <button type="submit" class="btn-primary" :disabled="saving">
        {{ saving ? 'Saving...' : (isEdit ? 'Update product' : 'Create product') }}
      </button>
      <NuxtLink :to="cancelTo" class="btn-secondary">Cancel</NuxtLink>
    </div>
  </form>
</template>

<script setup>
const props = defineProps({
  initial: { type: Object, default: null },
  isEdit: { type: Boolean, default: false },
  showCostPrice: { type: Boolean, default: true },
  cancelTo: { type: String, default: '/admin/products' },
})

const emit = defineEmits(['submit'])

const { adminFetch } = useAdminFetch()

const form = reactive({
  name: props.initial?.name ?? '',
  sku: props.initial?.sku ?? '',
  description: props.initial?.description ?? '',
  price: props.initial?.price ?? '',
  imageUrl: props.initial?.imageUrl ?? '',
  stock: props.initial?.stock ?? 0,
  categoryId: props.initial?.categoryId ?? null,
  brand: props.initial?.brand ?? '',
  unit: props.initial?.unit ?? '',
  weight: props.initial?.weight ?? '',
  countryOfOrigin: props.initial?.countryOfOrigin ?? '',
  storageInstructions: props.initial?.storageInstructions ?? '',
  expiryDate: props.initial?.expiryDate
    ? new Date(props.initial.expiryDate).toISOString().split('T')[0]
    : '',
  costPrice: props.initial?.costPrice ?? '',
  lowStockThreshold: props.initial?.lowStockThreshold ?? 10,
  isFeatured: props.initial?.isFeatured ?? false,
  reason: '',
})

// Unified image list — index 0 is always primary
const allImages = ref([
  ...(props.initial?.imageUrl ? [props.initial.imageUrl] : []),
  ...(props.initial?.images?.map((i) => i.url) ?? []),
])

const newImageUrl = ref('')
const fileInput = ref(null)
const uploading = ref(false)
const uploadProgress = ref('')
const saving = ref(false)
const error = ref('')

function setPrimary(idx) {
  if (idx === 0) return
  const img = allImages.value.splice(idx, 1)[0]
  allImages.value.unshift(img)
}

function removeImage(idx) {
  allImages.value.splice(idx, 1)
}

function addImageUrl() {
  const url = newImageUrl.value.trim()
  if (!url) return
  allImages.value.push(url)
  newImageUrl.value = ''
}

async function uploadFile(file) {
  const formData = new FormData()
  formData.append('image', file)
  const result = await adminFetch('/api/upload/image?folder=products', { method: 'POST', body: formData })
  return result.url
}

async function handleFiles(e) {
  const files = [...(e.target.files ?? [])]
  if (!files.length) return
  uploading.value = true
  for (let i = 0; i < files.length; i++) {
    uploadProgress.value = `${i + 1} / ${files.length}`
    try {
      const url = await uploadFile(files[i])
      allImages.value.push(url)
    } catch {
      error.value = `Failed to upload ${files[i].name}`
    }
  }
  uploading.value = false
  uploadProgress.value = ''
  e.target.value = ''
}

async function handleDrop(e) {
  const files = [...(e.dataTransfer.files ?? [])].filter((f) => f.type.startsWith('image/'))
  if (!files.length) return
  uploading.value = true
  for (let i = 0; i < files.length; i++) {
    uploadProgress.value = `${i + 1} / ${files.length}`
    try {
      const url = await uploadFile(files[i])
      allImages.value.push(url)
    } catch {
      error.value = `Failed to upload ${files[i].name}`
    }
  }
  uploading.value = false
  uploadProgress.value = ''
}

const { data: categories } = await useFetch('/api/categories')

// Per-store location map
const stores = ref([])
const loadingStores = ref(true)
const locationMap = ref({})

async function loadStoresAndLocations() {
  try {
    const [storeList, existingLocs] = await Promise.all([
      adminFetch('/api/admin/stores'),
      props.initial?.id
        ? adminFetch(`/api/products/${props.initial.id}/locations`).catch(() => [])
        : Promise.resolve([]),
    ])
    stores.value = storeList
    const locByStore = Object.fromEntries(existingLocs.map((l) => [l.storeId, l]))
    locationMap.value = Object.fromEntries(
      storeList.map((s) => [s.id, { aisle: locByStore[s.id]?.aisle ?? '', shelf: locByStore[s.id]?.shelf ?? '' }])
    )
  } finally {
    loadingStores.value = false
  }
}

onMounted(loadStoresAndLocations)


async function handleSubmit() {
  error.value = ''
  saving.value = true
  try {
    const savedProduct = await emit('submit', {
      name: form.name,
      sku: form.sku || null,
      description: form.description,
      price: Number(form.price),
      imageUrl: allImages.value[0] || null,
      stock: Number(form.stock),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      images: allImages.value.slice(1),
      brand: form.brand || null,
      unit: form.unit || null,
      weight: form.weight || null,
      countryOfOrigin: form.countryOfOrigin || null,
      storageInstructions: form.storageInstructions || null,
      expiryDate: form.expiryDate || null,
      costPrice: form.costPrice ? Number(form.costPrice) : null,
      lowStockThreshold: Number(form.lowStockThreshold),
      isFeatured: form.isFeatured,
      ...(props.isEdit && form.reason ? { reason: form.reason } : {}),
    })

    // Save per-store locations
    const productId = savedProduct?.id ?? props.initial?.id
    if (productId && stores.value.length) {
      const locations = stores.value.map((s) => ({
        storeId: s.id,
        aisle: locationMap.value[s.id]?.aisle || null,
        shelf: locationMap.value[s.id]?.shelf || null,
      }))
      await adminFetch(`/api/products/${productId}/locations`, {
        method: 'PUT',
        body: { locations },
      })
    }
  } catch (e) {
    error.value = e?.data?.statusMessage ?? 'Something went wrong'
  } finally {
    saving.value = false
  }
}
</script>
