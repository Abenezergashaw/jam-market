<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <div>
      <label class="label">Category name *</label>
      <input v-model="form.name" type="text" class="input" placeholder="e.g. Dairy & Eggs" required @input="autoSlug" />
    </div>

    <div>
      <label class="label">Slug *</label>
      <input v-model="form.slug" type="text" class="input" placeholder="e.g. dairy-eggs" required />
      <p class="text-xs text-zinc-400 mt-1.5">Lowercase letters, numbers, hyphens only</p>
    </div>

    <!-- Trending toggle -->
    <div class="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200">
      <div>
        <p class="text-sm font-medium text-zinc-800 flex items-center gap-1.5">
          🔥 Mark as Trending
        </p>
        <p class="text-xs text-zinc-500 mt-0.5">Shows in the featured trending section on the homepage</p>
      </div>
      <button
        type="button"
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0"
        :class="form.isTrending ? 'bg-amber-500' : 'bg-zinc-300'"
        @click="form.isTrending = !form.isTrending"
      >
        <span
          class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform"
          :class="form.isTrending ? 'translate-x-6' : 'translate-x-1'"
        />
      </button>
    </div>

    <div>
      <label class="label">Category image</label>
      <div class="flex items-start gap-4">
        <div class="w-20 h-20 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
          <img
            v-if="imagePreview"
            :src="imagePreview"
            alt="Preview"
            class="w-full h-full object-cover"
            @error="imagePreview = null"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div class="flex-1 space-y-2">
          <input
            type="file"
            accept="image/*"
            class="block w-full text-sm text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 cursor-pointer"
            @change="handleFileChange"
          />
          <p class="text-xs text-zinc-400">Or paste an image URL:</p>
          <input v-model="form.imageUrl" type="text" class="input text-sm" placeholder="https://..." />
        </div>
      </div>
    </div>

    <p v-if="error" class="text-sm text-brand-700 bg-brand-50 border border-brand-200 rounded-xl px-3 py-2">{{ error }}</p>

    <div class="flex gap-3 pt-1">
      <button type="submit" class="btn-primary" :disabled="saving">
        {{ saving ? 'Saving...' : (isEdit ? 'Update category' : 'Create category') }}
      </button>
      <NuxtLink to="/admin/categories" class="btn-secondary">Cancel</NuxtLink>
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
  slug: props.initial?.slug ?? '',
  imageUrl: props.initial?.imageUrl ?? '',
  isTrending: props.initial?.isTrending ?? false,
})

const imagePreview = ref(props.initial?.imageUrl ?? null)
const saving = ref(false)
const error = ref('')

watch(() => form.imageUrl, (val) => { if (val) imagePreview.value = val })

function autoSlug() {
  if (!props.isEdit) {
    form.slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
}

async function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('image', file)

  try {
    const result = await adminFetch('/api/upload/image?folder=categories', { method: 'POST', body: formData })
    form.imageUrl = result.url
    imagePreview.value = result.url
  } catch {
    error.value = 'Image upload failed. Try again.'
  }
}

async function handleSubmit() {
  error.value = ''
  saving.value = true
  try {
    await emit('submit', { ...form })
  } catch (e) {
    error.value = e?.data?.statusMessage ?? 'Something went wrong'
  } finally {
    saving.value = false
  }
}
</script>
