<template>
  <NuxtLink
    :to="`/product/${product.id}`"
    class="card overflow-hidden group flex flex-col hover:border-zinc-700 transition-all duration-200"
  >
    <!-- Image -->
    <div class="aspect-square overflow-hidden bg-zinc-800 shrink-0 relative">
      <img
        :src="product.imageUrl"
        :alt="product.name"
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        @error="$event.target.src = 'https://picsum.photos/seed/' + product.id + '/400/400'"
      />
      <!-- Out of stock overlay -->
      <div v-if="product.stock === 0" class="absolute inset-0 bg-zinc-950/70 flex items-center justify-center">
        <span class="text-xs font-semibold text-zinc-400 bg-zinc-900/80 px-3 py-1 rounded-full border border-zinc-700">Out of stock</span>
      </div>
      <!-- Low stock badge -->
      <div v-else-if="product.stock < 10" class="absolute top-2 right-2">
        <span class="badge badge-yellow text-[10px]">{{ product.stock }} left</span>
      </div>
      <!-- Multiple images indicator -->
      <div v-if="product.images?.length > 0" class="absolute bottom-2 right-2 flex items-center gap-0.5">
        <span v-for="i in Math.min(product.images.length + 1, 4)" :key="i" class="w-1 h-1 rounded-full bg-white/60" />
      </div>
    </div>

    <!-- Content -->
    <div class="p-3 sm:p-4 flex flex-col flex-1 gap-3">
      <div class="flex-1">
        <h3 class="text-sm font-semibold text-zinc-100 leading-snug line-clamp-2">{{ product.name }}</h3>
        <p class="text-xs text-zinc-500 mt-1 line-clamp-2">{{ product.description }}</p>
      </div>

      <div class="flex items-center justify-between gap-2">
        <span class="text-sm font-bold text-brand-400">${{ Number(product.price).toFixed(2) }}</span>
        <button
          v-if="product.stock > 0"
          class="text-xs bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/20 hover:border-brand-500/40 px-3 py-1.5 rounded-lg font-semibold transition-all active:scale-95"
          @click.prevent.stop="handleAdd"
        >
          Add
        </button>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const cartStore = useCartStore()

function handleAdd() {
  cartStore.addItem({
    id: props.product.id,
    name: props.product.name,
    price: props.product.price,
    imageUrl: props.product.imageUrl,
  })
}
</script>
