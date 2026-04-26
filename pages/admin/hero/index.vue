<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-xs text-zinc-500 font-medium">{{ slides?.length ?? 0 }} slides</p>
        <p class="text-[11px] text-zinc-400 mt-0.5">Changes go live on the homepage instantly.</p>
      </div>
      <NuxtLink to="/admin/hero/new" class="btn-primary text-xs py-2 px-4">+ Add slide</NuxtLink>
    </div>

    <div v-if="pending" class="card p-8 text-center text-zinc-400 text-sm animate-pulse">Loading...</div>

    <div v-else-if="!slides?.length" class="card p-14 text-center">
      <p class="text-zinc-400 text-sm mb-3">No hero slides yet.</p>
      <NuxtLink to="/admin/hero/new" class="text-brand-500 hover:text-brand-600 text-sm font-semibold transition-colors">Create the first one →</NuxtLink>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="slide in slides"
        :key="slide.id"
        class="card overflow-hidden flex items-stretch gap-0"
      >
        <!-- Image preview -->
        <div class="relative shrink-0 w-36 sm:w-48">
          <img
            :src="slide.imageUrl"
            :alt="slide.title"
            class="w-full h-full object-cover"
            @error="$event.target.src = 'https://picsum.photos/192/108'"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
        </div>

        <!-- Slide info -->
        <div class="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[10px] font-semibold uppercase tracking-widest text-brand-500 bg-brand-50 border border-brand-200 rounded-full px-2 py-0.5 truncate max-w-[140px]">{{ slide.tag }}</span>
              <span
                class="text-[10px] font-semibold rounded-full px-2 py-0.5"
                :class="slide.isActive ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'"
              >
                {{ slide.isActive ? 'Active' : 'Hidden' }}
              </span>
            </div>
            <p class="font-semibold text-zinc-900 text-sm leading-tight truncate">{{ slide.title }}</p>
            <p class="text-xs text-zinc-400 mt-0.5 truncate">{{ slide.subtitle }}</p>
          </div>

          <div class="flex items-center gap-4 mt-3">
            <div class="flex items-center gap-1">
              <button
                :disabled="slide.position === 0"
                class="w-6 h-6 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:border-zinc-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move up"
                @click="moveSlide(slide, -1)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <span class="text-[10px] text-zinc-400 font-mono w-4 text-center">{{ slide.position + 1 }}</span>
              <button
                :disabled="slide.position === slides.length - 1"
                class="w-6 h-6 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:border-zinc-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move down"
                @click="moveSlide(slide, 1)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <button
              class="text-[11px] font-semibold transition-colors"
              :class="slide.isActive ? 'text-zinc-400 hover:text-zinc-600' : 'text-green-500 hover:text-green-700'"
              @click="toggleActive(slide)"
            >
              {{ slide.isActive ? 'Hide' : 'Show' }}
            </button>

            <NuxtLink :to="`/admin/hero/${slide.id}`" class="text-[11px] text-brand-500 hover:text-brand-600 font-semibold transition-colors">Edit</NuxtLink>

            <button class="text-[11px] text-zinc-400 hover:text-red-500 transition-colors" @click="deleteSlide(slide)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const { adminFetch } = useAdminFetch()
const { data: slides, pending, refresh } = useAsyncData('hero-slides-admin', () => adminFetch('/api/hero-slides'))

async function toggleActive(slide) {
  try {
    await adminFetch(`/api/hero-slides/${slide.id}`, { method: 'PUT', body: { isActive: !slide.isActive } })
    await refresh()
  } catch (e) {
    alert(e?.data?.statusMessage ?? 'Could not update slide')
  }
}

async function moveSlide(slide, dir) {
  const sorted = [...(slides.value ?? [])].sort((a, b) => a.position - b.position)
  const idx = sorted.findIndex((s) => s.id === slide.id)
  const swapIdx = idx + dir
  if (swapIdx < 0 || swapIdx >= sorted.length) return

  const other = sorted[swapIdx]
  try {
    await Promise.all([
      adminFetch(`/api/hero-slides/${slide.id}`, { method: 'PUT', body: { position: other.position } }),
      adminFetch(`/api/hero-slides/${other.id}`, { method: 'PUT', body: { position: slide.position } }),
    ])
    await refresh()
  } catch (e) {
    alert(e?.data?.statusMessage ?? 'Could not reorder slides')
  }
}

async function deleteSlide(slide) {
  if (!confirm(`Delete slide "${slide.title}"?`)) return
  try {
    await adminFetch(`/api/hero-slides/${slide.id}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    alert(e?.data?.statusMessage ?? 'Could not delete slide')
  }
}

useHead({ title: 'Hero Slides — Admin' })
</script>
