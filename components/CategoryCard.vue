<template>
  <NuxtLink
    :to="`/category/${category.id}`"
    class="group relative overflow-hidden rounded-2xl aspect-[4/3] block bg-zinc-800"
  >
    <img
      :src="category.imageUrl"
      :alt="category.name"
      loading="lazy"
      class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      @error="$event.target.src = 'https://picsum.photos/400/300'"
    />
    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    <!-- Subtle shimmer on hover -->
    <div class="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/5 transition-colors duration-300" />
    <!-- Name -->
    <div class="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
      <h3 class="text-sm sm:text-base font-semibold text-white leading-tight">{{ category.name }}</h3>
    </div>
  </NuxtLink>
</template>

<script setup>
defineProps({
  category: {
    type: Object,
    required: true,
  },
})
</script>
