<template>
  <div class="max-w-lg mx-auto px-4 py-10">
    <NuxtLink to="/info" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-brand-500 transition-colors mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </NuxtLink>

    <h1 class="text-xl font-bold text-zinc-900 mb-1">Share Your Feedback</h1>
    <p class="text-sm text-zinc-500 mb-6">Tell us about your experience — service, staff, or anything about the store.</p>

    <!-- Success state -->
    <div v-if="submitted" class="card p-8 text-center space-y-4">
      <div class="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <p class="font-bold text-zinc-900 text-lg">Thank you!</p>
        <p class="text-sm text-zinc-500 mt-1">Your feedback has been received. We appreciate you taking the time.</p>
      </div>
      <NuxtLink to="/info" class="btn-primary inline-flex">Back to Home</NuxtLink>
    </div>

    <!-- Form -->
    <form v-else class="card p-5 space-y-5" @submit.prevent="submit">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label">Your name <span class="text-zinc-400 font-normal normal-case tracking-normal">(optional)</span></label>
          <input v-model="form.name" type="text" class="input" placeholder="e.g. Ato Lemma" maxlength="100" />
        </div>
        <div>
          <label class="label">Phone <span class="text-zinc-400 font-normal normal-case tracking-normal">(optional)</span></label>
          <input v-model="form.phone" type="tel" class="input" placeholder="+251..." maxlength="30" />
        </div>
      </div>

      <div>
        <label class="label">Overall rating <span class="text-zinc-400 font-normal normal-case tracking-normal">(optional)</span></label>
        <div class="mt-1">
          <StarRating :model-value="form.rating ?? 0" size="lg" @update:model-value="form.rating = $event" />
          <button v-if="form.rating" type="button" class="text-xs text-zinc-400 hover:text-zinc-600 mt-1 transition-colors" @click="form.rating = null">Clear rating</button>
        </div>
      </div>

      <div>
        <label class="label">Your message <span class="text-brand-500">*</span></label>
        <textarea
          v-model="form.message"
          class="input resize-none"
          rows="4"
          maxlength="2000"
          placeholder="Tell us about your experience — service quality, cleanliness, staff attitude, delivery…"
          required
        />
        <p class="text-xs text-zinc-400 mt-1 text-right">{{ form.message.length }}/2000</p>
      </div>

      <p v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{{ error }}</p>

      <button type="submit" class="btn-primary w-full py-3" :disabled="submitting">
        {{ submitting ? 'Submitting…' : 'Submit Feedback' }}
      </button>
    </form>
  </div>
</template>

<script setup>
useHead({ title: 'Leave Feedback — Jam Supermarket' })

const form = reactive({
  name: '',
  phone: '',
  message: '',
  rating: null,
})

const submitting = ref(false)
const submitted = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    await $fetch('/api/feedback', {
      method: 'POST',
      body: {
        name: form.name || undefined,
        phone: form.phone || undefined,
        message: form.message,
        rating: form.rating || undefined,
      },
    })
    submitted.value = true
  } catch (e) {
    error.value = e?.data?.statusMessage ?? 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
