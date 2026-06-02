<template>
  <div class="space-y-4 max-w-4xl">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-lg font-bold text-zinc-900">Store Feedback</h1>
        <p class="text-xs text-zinc-400 mt-0.5">Customer comments about service, staff, and the store experience.</p>
      </div>
      <!-- Filter tabs -->
      <div class="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
          :class="filter === tab.value ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'"
          @click="filter = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <div v-for="n in 4" :key="n" class="card h-20 animate-pulse bg-zinc-50" />
    </div>

    <!-- Empty -->
    <div v-else-if="!items.length" class="card p-12 text-center text-zinc-400">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
      <p class="text-sm">No feedback yet{{ filter ? ' in this category' : '' }}.</p>
    </div>

    <!-- List -->
    <div v-else class="card divide-y divide-zinc-100">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-start gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors cursor-pointer"
        @click="open(item)"
      >
        <!-- Status dot -->
        <span
          class="mt-1 w-2.5 h-2.5 rounded-full shrink-0"
          :class="item.status === 'NEW' ? 'bg-amber-400' : 'bg-green-400'"
        />

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-semibold text-zinc-900">{{ item.name || 'Anonymous' }}</span>
            <span v-if="item.employeeName" class="text-xs text-zinc-400">re: {{ item.employeeName }}</span>
            <StarRating v-if="item.rating" :model-value="item.rating" readonly size="sm" />
          </div>
          <p class="text-sm text-zinc-600 mt-0.5 line-clamp-2">{{ item.message }}</p>
          <p class="text-xs text-zinc-400 mt-1">{{ formatDate(item.createdAt) }}</p>
        </div>

        <span
          class="badge shrink-0 mt-1"
          :class="item.status === 'NEW' ? 'badge-yellow' : 'badge-green'"
        >{{ item.status === 'NEW' ? 'New' : 'Reviewed' }}</span>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="total > 20" class="flex items-center justify-between text-sm text-zinc-500">
      <span>{{ (page - 1) * 20 + 1 }}–{{ Math.min(page * 20, total) }} of {{ total }}</span>
      <div class="flex gap-2">
        <button class="btn-secondary text-xs py-1.5 px-3" :disabled="page === 1" @click="page--">Previous</button>
        <button class="btn-secondary text-xs py-1.5 px-3" :disabled="page * 20 >= total" @click="page++">Next</button>
      </div>
    </div>
  </div>

  <!-- Detail panel -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="selected" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="selected = null">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="selected = null" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-start justify-between gap-3 px-5 py-4 border-b border-zinc-100">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <p class="font-bold text-zinc-900">{{ selected.name || 'Anonymous' }}</p>
                <StarRating v-if="selected.rating" :model-value="selected.rating" readonly size="sm" />
              </div>
              <p class="text-xs text-zinc-400 mt-0.5">{{ formatDate(selected.createdAt) }}</p>
            </div>
            <button class="p-1.5 text-zinc-400 hover:text-zinc-700 shrink-0 transition-colors" @click="selected = null">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="overflow-y-auto flex-1 px-5 py-4 space-y-4">
            <!-- Contact info -->
            <div v-if="selected.phone || selected.employeeName" class="flex gap-4 text-sm text-zinc-600">
              <div v-if="selected.phone" class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {{ selected.phone }}
              </div>
              <div v-if="selected.employeeName" class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Re: {{ selected.employeeName }}
              </div>
            </div>

            <!-- Message -->
            <div class="bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{{ selected.message }}</div>

            <!-- Previous review note -->
            <div v-if="selected.status === 'REVIEWED'" class="space-y-2">
              <p class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Reviewed by {{ selected.reviewedBy?.name || selected.reviewedBy?.email || 'Admin' }}</p>
              <div v-if="selected.reviewNote" class="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">{{ selected.reviewNote }}</div>
              <p v-else class="text-xs text-zinc-400">No review note added.</p>
            </div>

            <!-- Review action (only for NEW) -->
            <div v-if="selected.status === 'NEW'" class="space-y-3 border-t border-zinc-100 pt-4">
              <label class="label">Internal note <span class="text-zinc-400 font-normal normal-case tracking-normal">(optional)</span></label>
              <textarea
                v-model="reviewNote"
                class="input resize-none"
                rows="3"
                maxlength="1000"
                placeholder="e.g. Spoke to employee, issue resolved. Will follow up with shift manager."
              />
              <button
                class="btn-primary w-full"
                :disabled="saving"
                @click="markReviewed"
              >
                {{ saving ? 'Saving…' : 'Mark as Reviewed' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const { adminFetch } = useAdminFetch()

const tabs = [
  { label: 'All', value: '' },
  { label: 'New', value: 'NEW' },
  { label: 'Reviewed', value: 'REVIEWED' },
]

const filter = ref('')
const page = ref(1)
const items = ref([])
const total = ref(0)
const loading = ref(true)
const selected = ref(null)
const reviewNote = ref('')
const saving = ref(false)

async function load() {
  loading.value = true
  try {
    const qs = new URLSearchParams({ page: page.value })
    if (filter.value) qs.set('status', filter.value)
    const res = await adminFetch(`/api/admin/feedback?${qs}`)
    items.value = res.items
    total.value = res.total
  } finally {
    loading.value = false
  }
}

watch([filter, page], () => {
  if (filter.value) page.value = 1
  load()
})

onMounted(load)

function open(item) {
  selected.value = item
  reviewNote.value = ''
}

async function markReviewed() {
  saving.value = true
  try {
    await adminFetch(`/api/admin/feedback/${selected.value.id}`, {
      method: 'PATCH',
      body: { reviewNote: reviewNote.value || undefined },
    })
    const idx = items.value.findIndex((i) => i.id === selected.value.id)
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], status: 'REVIEWED', reviewNote: reviewNote.value }
    }
    selected.value = null
  } catch (e) {
    alert(e?.data?.statusMessage ?? 'Failed to save')
  } finally {
    saving.value = false
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

useHead({ title: 'Store Feedback — Admin' })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-active .relative, .fade-leave-active .relative { transition: transform 0.2s ease; }
.fade-enter-from .relative, .fade-leave-to .relative { transform: scale(0.95); }
</style>
