<template>
  <NuxtLink
    :to="`/category/${category.id}`"
    class="group relative overflow-hidden rounded-2xl bg-zinc-100 block shrink-0 w-[280px] sm:w-auto aspect-[5/3] snap-start border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all duration-300"
  >
    <img
      :src="category.imageUrl"
      :alt="category.name"
      loading="lazy"
      class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      @error="$event.target.src = 'https://picsum.photos/500/300'"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
    <div class="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/8 transition-all duration-500" />

    <div class="absolute top-3 left-3">
      <span class="inline-flex items-center gap-1.5 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-amber-900/30">
        🔥 Trending
      </span>
    </div>

    <div class="absolute bottom-0 left-0 right-0 p-4">
      <h3 class="text-base sm:text-lg font-bold text-white leading-tight">{{ category.name }}</h3>
      <p class="text-xs text-white/50 mt-1 flex items-center gap-1 group-hover:text-white/80 transition-colors duration-300">
        Shop now
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </p>
    </div>
  </NuxtLink>
</template>

<script setup>
defineProps({ category: { type: Object, required: true } })
</script>
