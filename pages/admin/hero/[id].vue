<template>
  <div class="max-w-lg">
    <div class="mb-6">
      <NuxtLink to="/admin/hero" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-brand-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to hero slides
      </NuxtLink>
      <h2 class="text-lg font-bold text-zinc-900 mt-3">{{ isNew ? 'New slide' : 'Edit slide' }}</h2>
    </div>

    <!-- Image preview -->
    <div v-if="form.imageUrl" class="mb-4 rounded-2xl overflow-hidden relative" style="height: 200px;">
      <img
        :src="form.imageUrl"
        alt="Slide preview"
        class="w-full h-full object-cover"
        @error="previewError = true"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-end p-4">
        <div>
          <span class="text-[10px] text-white/70 font-semibold uppercase tracking-widest block mb-1">{{ form.tag || 'Tag preview' }}</span>
          <p class="text-white font-bold text-sm leading-tight">{{ form.title || 'Title preview' }}</p>
        </div>
      </div>
    </div>

    <div class="card p-5 sm:p-6 space-y-4">

      <!-- Tag -->
      <div>
        <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Badge tag <span class="text-zinc-400 font-normal">(shown above the title)</span></label>
        <input v-model="form.tag" type="text" class="input" placeholder="e.g. Fresh daily arrivals" />
      </div>

      <!-- Title -->
      <div>
        <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Headline</label>
        <input v-model="form.title" type="text" class="input" placeholder="e.g. Farm-Fresh Groceries at Your Door" />
      </div>

      <!-- Subtitle -->
      <div>
        <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Subtitle</label>
        <textarea v-model="form.subtitle" class="input resize-none" rows="2" placeholder="Short supporting text shown below the headline" />
      </div>

      <!-- CTA -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Button label</label>
          <input v-model="form.ctaLabel" type="text" class="input" placeholder="Shop Now" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Button link</label>
          <input v-model="form.ctaHref" type="text" class="input" placeholder="/#categories" />
        </div>
      </div>

      <!-- Image -->
      <div>
        <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Background image</label>

        <div class="flex gap-2 mb-2">
          <button
            class="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            :class="imageMode === 'upload' ? 'bg-brand-500 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'"
            @click="imageMode = 'upload'"
          >Upload file</button>
          <button
            class="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            :class="imageMode === 'url' ? 'bg-brand-500 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'"
            @click="imageMode = 'url'"
          >Paste URL</button>
        </div>

        <div v-if="imageMode === 'upload'">
          <label class="flex items-center justify-center gap-2 w-full border-2 border-dashed border-zinc-200 rounded-xl p-4 cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-xs text-zinc-500">{{ uploading ? 'Uploading…' : 'Click to upload image' }}</span>
            <input type="file" accept="image/*" class="hidden" :disabled="uploading" @change="uploadImage" />
          </label>
        </div>
        <div v-else>
          <input v-model="form.imageUrl" type="url" class="input" placeholder="https://images.unsplash.com/..." />
        </div>
      </div>

      <!-- Position & Active -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-zinc-700 mb-1.5">Position <span class="text-zinc-400 font-normal">(order in carousel)</span></label>
          <input v-model.number="form.position" type="number" min="0" class="input" />
        </div>
        <div class="flex flex-col justify-end pb-0.5">
          <label class="flex items-center gap-2.5 cursor-pointer">
            <div
              class="relative w-9 h-5 rounded-full transition-colors duration-200"
              :class="form.isActive ? 'bg-brand-500' : 'bg-zinc-200'"
              @click="form.isActive = !form.isActive"
            >
              <span
                class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
                :class="form.isActive ? 'translate-x-4' : 'translate-x-0'"
              />
            </div>
            <span class="text-xs font-medium text-zinc-700">{{ form.isActive ? 'Visible on site' : 'Hidden from site' }}</span>
          </label>
        </div>
      </div>

      <!-- Error -->
      <p v-if="error" class="text-xs text-red-500">{{ error }}</p>

      <!-- Actions -->
      <div class="flex items-center gap-3 pt-2">
        <button
          class="btn-primary flex-1"
          :disabled="saving"
          @click="handleSubmit"
        >
          {{ saving ? 'Saving…' : (isNew ? 'Create slide' : 'Save changes') }}
        </button>
        <NuxtLink to="/admin/hero" class="text-sm text-zinc-500 hover:text-zinc-700 transition-colors">Cancel</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const route = useRoute()
const router = useRouter()
const { adminFetch } = useAdminFetch()

const isNew = computed(() => route.params.id === 'new')

const form = reactive({
  tag: '',
  title: '',
  subtitle: '',
  ctaLabel: 'Shop Now',
  ctaHref: '/#categories',
  imageUrl: '',
  position: 0,
  isActive: true,
})

const imageMode = ref('upload')
const uploading = ref(false)
const saving = ref(false)
const error = ref('')
const previewError = ref(false)

if (!isNew.value) {
  const slides = await $fetch('/api/hero-slides')
  const slide = slides.find((s) => s.id === parseInt(route.params.id))
  if (slide) {
    Object.assign(form, slide)
    imageMode.value = 'url'
  }
}

async function uploadImage(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await adminFetch('/api/upload/image', { method: 'POST', body: fd })
    form.imageUrl = res.url
    previewError.value = false
  } catch (err) {
    error.value = err?.data?.statusMessage ?? 'Upload failed'
  } finally {
    uploading.value = false
  }
}

async function handleSubmit() {
  error.value = ''
  if (!form.title || !form.imageUrl || !form.tag) {
    error.value = 'Tag, headline, and image are required.'
    return
  }
  saving.value = true
  try {
    if (isNew.value) {
      await adminFetch('/api/hero-slides', { method: 'POST', body: { ...form } })
    } else {
      await adminFetch(`/api/hero-slides/${route.params.id}`, { method: 'PUT', body: { ...form } })
    }
    router.push('/admin/hero')
  } catch (err) {
    error.value = err?.data?.statusMessage ?? 'Could not save slide'
  } finally {
    saving.value = false
  }
}

useHead({ title: isNew.value ? 'New Hero Slide — Admin' : 'Edit Hero Slide — Admin' })
</script>
