<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-zinc-50">
    <div class="w-full max-w-sm space-y-8">
      <!-- Branding -->
      <div class="text-center">
        <img src="/logo.svg" alt="Jam Supermarket" class="h-16 mx-auto mb-4" onerror="this.src='/logo.jpg'" />
        <h1 class="text-2xl font-bold text-zinc-900">Jam Supermarket</h1>
        <p class="text-sm text-zinc-500 mt-1">What would you like to do?</p>
      </div>

      <!-- Action buttons -->
      <div class="space-y-3">
        <NuxtLink to="/" class="btn-primary w-full py-4 text-base gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Shop Online
        </NuxtLink>

        <NuxtLink to="/feedback" class="btn-secondary w-full py-4 text-base gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          Leave Feedback
        </NuxtLink>

        <NuxtLink to="/find-product" class="btn-secondary w-full py-4 text-base gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Find a Product in Store
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Jam Supermarket' })
</script>
