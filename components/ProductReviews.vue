<template>
  <section>
    <h2 class="text-lg font-bold text-zinc-900 mb-6">Customer Reviews</h2>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="bg-white rounded-2xl border border-zinc-100 p-4 animate-pulse">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-9 h-9 rounded-full bg-zinc-200 shrink-0" />
          <div class="space-y-1.5 flex-1">
            <div class="h-3 w-24 bg-zinc-200 rounded" />
            <div class="h-3 w-20 bg-zinc-200 rounded" />
          </div>
        </div>
        <div class="space-y-1.5">
          <div class="h-3 bg-zinc-200 rounded w-full" />
          <div class="h-3 bg-zinc-200 rounded w-4/5" />
        </div>
      </div>
    </div>

    <template v-else>

      <!-- Summary block -->
      <div v-if="summary && summary.count > 0" class="bg-white rounded-2xl border border-zinc-100 p-5 sm:p-6 mb-6 flex flex-col sm:flex-row gap-6">
        <!-- Avg score -->
        <div class="flex flex-col items-center justify-center gap-1 sm:pr-6 sm:border-r sm:border-zinc-100 shrink-0">
          <span class="text-5xl font-black text-zinc-900 leading-none">{{ summary.avgRating }}</span>
          <StarRating :model-value="summary.avgRating" readonly size="md" />
          <span class="text-xs text-zinc-400 mt-0.5">{{ summary.count }} {{ summary.count === 1 ? 'review' : 'reviews' }}</span>
        </div>
        <!-- Distribution bars -->
        <div class="flex-1 space-y-1.5">
          <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-2">
            <span class="text-xs text-zinc-500 w-2 shrink-0">{{ star }}</span>
            <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 13.14 2 9.27l6.91-1.01L12 2z" fill="#629e3a" stroke="#629e3a" stroke-width="1.5" stroke-linejoin="round"/></svg>
            <div class="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-[#629e3a] rounded-full transition-all duration-500"
                :style="{ width: barPct(star) + '%' }"
              />
            </div>
            <span class="text-xs text-zinc-400 w-4 text-right shrink-0">{{ summary.distribution[star] ?? 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Write / Edit review card -->
      <div class="bg-white rounded-2xl border border-zinc-100 p-5 mb-6">
        <!-- Guest prompt -->
        <template v-if="!customerStore.isAuthenticated">
          <p class="text-sm text-zinc-600 mb-3">Sign in with Telegram to leave a review.</p>
          <NuxtLink to="/login" class="inline-flex items-center gap-2 bg-[#1d72b8] hover:bg-[#155f9c] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">
            Sign in
          </NuxtLink>
        </template>

        <!-- Logged-in form -->
        <template v-else>
          <h3 class="text-sm font-bold text-zinc-900 mb-4">{{ myReview ? 'Update your review' : 'Write a review' }}</h3>

          <div class="flex items-center gap-3 mb-4">
            <StarRating v-model="myRating" size="lg" />
            <span class="text-xs text-zinc-400">{{ ratingLabel }}</span>
          </div>

          <textarea
            v-model="myComment"
            class="w-full text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-forest-400 focus:bg-white transition placeholder-zinc-400"
            placeholder="Share your thoughts (optional)"
            rows="3"
            maxlength="1000"
          />
          <div class="flex items-center justify-between mt-1 mb-3">
            <p v-if="submitError" class="text-xs text-red-500">{{ submitError }}</p>
            <p v-else-if="submitSuccess" class="text-xs text-[#175B35] font-semibold">Review submitted!</p>
            <span v-else />
            <span class="text-[10px] text-zinc-400">{{ myComment.length }}/1000</span>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="bg-[#1d72b8] hover:bg-[#155f9c] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors shadow-sm active:scale-95"
              :disabled="submitLoading || myRating === 0"
              @click="submitReview"
            >
              {{ submitLoading ? 'Saving…' : (myReview ? 'Update' : 'Submit') }}
            </button>
            <button
              v-if="myReview"
              class="text-sm font-semibold text-red-500 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
              @click="deleteReview(myReview.id)"
            >
              Remove
            </button>
          </div>
        </template>
      </div>

      <!-- Empty state -->
      <div v-if="reviews.length === 0" class="text-center py-10 text-zinc-400">
        <svg class="w-10 h-10 mx-auto mb-3 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p class="text-sm">No reviews yet. Be the first!</p>
      </div>

      <!-- Review list -->
      <ul v-else class="space-y-3">
        <li
          v-for="review in reviews"
          :key="review.id"
          class="bg-white rounded-2xl border border-zinc-100 p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <!-- Avatar -->
              <div class="w-9 h-9 rounded-full bg-forest-100 text-forest-600 flex items-center justify-center text-xs font-bold shrink-0">
                {{ review.customer.displayName[0].toUpperCase() }}
              </div>
              <div>
                <p class="text-sm font-semibold text-zinc-900">{{ review.customer.displayName }}</p>
                <StarRating :model-value="review.rating" readonly size="sm" />
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span v-if="wasEdited(review)" class="text-[10px] text-zinc-400 italic">edited</span>
              <time class="text-xs text-zinc-400">{{ formatDate(review.createdAt) }}</time>
            </div>
          </div>
          <p v-if="review.comment" class="mt-2.5 text-sm text-zinc-600 leading-relaxed">{{ review.comment }}</p>
        </li>
      </ul>

      <!-- Load more -->
      <button
        v-if="page < totalPages"
        class="w-full mt-4 py-2.5 text-sm font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-colors disabled:opacity-50"
        :disabled="loadingMore"
        @click="loadReviews(page + 1)"
      >
        {{ loadingMore ? 'Loading…' : 'Load more reviews' }}
      </button>

    </template>
  </section>
</template>

<script setup>
const props = defineProps({ productId: { type: Number, required: true } })

const customerStore = useCustomerStore()
const { customerFetch } = useCustomerFetch()

const reviews    = ref([])
const summary    = ref(null)
const total      = ref(0)
const totalPages = ref(1)
const page       = ref(1)
const loading    = ref(false)
const loadingMore = ref(false)

const myRating      = ref(0)
const myComment     = ref('')
const myReview      = ref(null)
const submitLoading = ref(false)
const submitError   = ref(null)
const submitSuccess = ref(false)

const ratingLabel = computed(() => ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][myRating.value] ?? '')

async function loadReviews(pageNum, reset = false) {
  if (reset) loading.value = true
  else loadingMore.value = true
  try {
    const headers = customerStore.token ? { Authorization: `Bearer ${customerStore.token}` } : {}
    const data = await $fetch(`/api/products/${props.productId}/reviews`, {
      query: { page: pageNum, limit: 5 },
      headers,
    })
    if (reset) {
      reviews.value = data.reviews
      const own = data.reviews.find((r) => r.isOwn)
      if (own) { myReview.value = own; myRating.value = own.rating; myComment.value = own.comment ?? '' }
      else { myReview.value = null }
    } else {
      reviews.value.push(...data.reviews)
    }
    summary.value    = data.summary
    total.value      = data.total
    totalPages.value = data.totalPages
    page.value       = pageNum
  } finally {
    loading.value     = false
    loadingMore.value = false
  }
}

async function submitReview() {
  if (myRating.value === 0) { submitError.value = 'Please select a star rating.'; return }
  submitLoading.value = true
  submitError.value   = null
  try {
    const result = await customerFetch(`/api/products/${props.productId}/reviews`, {
      method: 'POST',
      body: { rating: myRating.value, comment: myComment.value || undefined },
    })
    submitSuccess.value = true
    myReview.value = result
    await loadReviews(1, true)
    setTimeout(() => { submitSuccess.value = false }, 3000)
  } catch (e) {
    submitError.value = e?.data?.statusMessage ?? 'Failed to submit. Please try again.'
  } finally {
    submitLoading.value = false
  }
}

async function deleteReview(id) {
  if (!confirm('Remove your review?')) return
  await customerFetch(`/api/products/${props.productId}/reviews/${id}`, { method: 'DELETE' })
  myReview.value = null; myRating.value = 0; myComment.value = ''
  await loadReviews(1, true)
}

function barPct(star) {
  if (!summary.value?.count) return 0
  return Math.round(((summary.value.distribution[star] ?? 0) / summary.value.count) * 100)
}

function formatDate(iso) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso))
}

function wasEdited(review) {
  return Math.abs(new Date(review.updatedAt) - new Date(review.createdAt)) > 1000
}

onMounted(() => loadReviews(1, true))
</script>
