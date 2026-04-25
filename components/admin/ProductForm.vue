<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div>
        <label class="label">Product name *</label>
        <input v-model="form.name" type="text" class="input" placeholder="e.g. Organic Bananas" required />
      </div>
      <div>
        <label class="label">Price ($) *</label>
        <input v-model="form.price" type="number" step="0.01" min="0.01" class="input" placeholder="2.99" required />
      </div>
    </div>

    <div>
      <label class="label">Description</label>
      <textarea v-model="form.description" class="input resize-none" rows="3" placeholder="Short product description..." />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div>
        <label class="label">Category</label>
        <select v-model="form.categoryId" class="input">
          <option :value="null">Uncategorized</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
      <div>
        <label class="label">Stock</label>
        <input v-model="form.stock" type="number" min="0" class="input" placeholder="0" />
      </div>
    </div>

    <!-- Primary image -->
    <div>
      <label class="label">Primary image <span class="text-zinc-600 font-normal">(shown in listings)</span></label>
      <div class="flex items-start gap-4">
        <div class="w-20 h-20 rounded-xl bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700">
          <img
            v-if="primaryPreview"
            :src="primaryPreview"
            alt="Preview"
            class="w-full h-full object-cover"
            @error="primaryPreview = null"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-zinc-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div class="flex-1 space-y-2">
          <input
            type="file"
            accept="image/*"
            class="block w-full text-sm text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-500/10 file:text-brand-400 hover:file:bg-brand-500/20 cursor-pointer"
            @change="handlePrimaryFile"
          />
          <p class="text-xs text-zinc-600">Or paste an image URL:</p>
          <input v-model="form.imageUrl" type="text" class="input text-sm" placeholder="https://..." />
        </div>
      </div>
    </div>

    <!-- Additional images gallery -->
    <div>
      <label class="label">
        Additional images
        <span class="text-zinc-600 font-normal">(shown in product gallery)</span>
      </label>

      <!-- Existing extra images grid -->
      <div v-if="form.images.length > 0" class="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
        <div
          v-for="(img, idx) in form.images"
          :key="idx"
          class="relative aspect-square rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 group"
        >
          <img :src="img" class="w-full h-full object-cover" @error="$event.target.src = 'https://picsum.photos/80/80'" />
          <button
            type="button"
            class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            @click="removeExtraImage(idx)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <div class="absolute bottom-1 left-1 text-[9px] text-white/60 bg-black/40 px-1 rounded">{{ idx + 1 }}</div>
        </div>
      </div>

      <!-- Add image row -->
      <div class="flex gap-2 items-start">
        <input
          v-model="newImageUrl"
          type="text"
          class="input text-sm flex-1"
          placeholder="Paste image URL and press Add"
          @keydown.enter.prevent="addExtraImageUrl"
        />
        <button type="button" class="btn-secondary text-sm py-2.5 shrink-0" @click="addExtraImageUrl">Add URL</button>
      </div>
      <div class="flex items-center gap-3 mt-2">
        <input
          type="file"
          accept="image/*"
          class="block text-sm text-zinc-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-700 file:text-zinc-300 hover:file:bg-zinc-600 cursor-pointer"
          @change="handleExtraFile"
        />
        <p v-if="uploadingExtra" class="text-xs text-zinc-500">Uploading...</p>
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{{ error }}</p>

    <div class="flex gap-3 pt-1">
      <button type="submit" class="btn-primary" :disabled="saving">
        {{ saving ? 'Saving...' : (isEdit ? 'Update product' : 'Create product') }}
      </button>
      <NuxtLink to="/admin/products" class="btn-secondary">Cancel</NuxtLink>
    </div>
  </form>
</template>

<script setup>
const props = defineProps({
  initial: { type: Object, default: null },
  isEdit: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

const { adminFetch } = useAdminFetch()

const form = reactive({
  name: props.initial?.name ?? '',
  description: props.initial?.description ?? '',
  price: props.initial?.price ?? '',
  imageUrl: props.initial?.imageUrl ?? '',
  stock: props.initial?.stock ?? 0,
  categoryId: props.initial?.categoryId ?? null,
  images: props.initial?.images?.map((i) => i.url) ?? [],
})

const primaryPreview = ref(props.initial?.imageUrl ?? null)
const newImageUrl = ref('')
const saving = ref(false)
const uploadingExtra = ref(false)
const error = ref('')

watch(() => form.imageUrl, (val) => {
  if (val) primaryPreview.value = val
})

const { data: categories } = await useFetch('/api/categories')

async function handlePrimaryFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('image', file)
  try {
    const result = await adminFetch('/api/upload/image', { method: 'POST', body: formData })
    form.imageUrl = result.url
    primaryPreview.value = result.url
  } catch {
    error.value = 'Primary image upload failed.'
  }
}

async function handleExtraFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploadingExtra.value = true
  const formData = new FormData()
  formData.append('image', file)
  try {
    const result = await adminFetch('/api/upload/image', { method: 'POST', body: formData })
    form.images.push(result.url)
    e.target.value = ''
  } catch {
    error.value = 'Extra image upload failed.'
  } finally {
    uploadingExtra.value = false
  }
}

function addExtraImageUrl() {
  const url = newImageUrl.value.trim()
  if (!url) return
  form.images.push(url)
  newImageUrl.value = ''
}

function removeExtraImage(idx) {
  form.images.splice(idx, 1)
}

async function handleSubmit() {
  error.value = ''
  saving.value = true
  try {
    await emit('submit', {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      imageUrl: form.imageUrl,
      stock: Number(form.stock),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      images: form.images,
    })
  } catch (e) {
    error.value = e?.data?.statusMessage ?? 'Something went wrong'
  } finally {
    saving.value = false
  }
}
</script>
