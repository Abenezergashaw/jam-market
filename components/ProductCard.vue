<template>
  <NuxtLink
    :to="`/product/${product.id}`"
    class="card overflow-hidden group flex flex-col hover:border-zinc-300 hover:shadow-sm transition-all duration-200"
  >
    <!-- Image -->
    <div class="aspect-square overflow-hidden bg-zinc-100 shrink-0 relative">
      <img
        :src="product.imageUrl"
        :alt="product.name"
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        @error="$event.target.src = 'https://picsum.photos/seed/' + product.id + '/400/400'"
      />
      <div v-if="product.stock === 0" class="absolute inset-0 bg-white/80 flex items-center justify-center">
        <span class="text-xs font-semibold text-zinc-600 bg-white px-3 py-1 rounded-full border border-zinc-200">Out of stock</span>
      </div>
      <div v-else-if="product.stock < 10" class="absolute top-2 right-2">
        <span class="badge badge-yellow text-[10px]">{{ product.stock }} left</span>
      </div>
      <div v-if="product.images?.length > 0" class="absolute bottom-2 right-2 flex items-center gap-0.5">
        <span v-for="i in Math.min(product.images.length + 1, 4)" :key="i" class="w-1 h-1 rounded-full bg-zinc-400/60" />
      </div>
    </div>

    <!-- Content -->
    <div class="p-3 sm:p-4 flex flex-col flex-1 gap-3">
      <div class="flex-1">
        <p v-if="product.brand" class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">{{ product.brand }}</p>
        <h3 class="text-sm font-semibold text-zinc-900 leading-snug line-clamp-2">{{ product.name }}</h3>
        <p class="text-xs text-zinc-400 mt-1 line-clamp-2">{{ product.description }}</p>
      </div>

      <div class="flex items-center justify-between gap-2">
        <div>
          <span class="text-sm font-bold text-zinc-800">ETB {{ Number(product.price).toFixed(2) }}</span>
          <span v-if="product.unit" class="text-xs text-zinc-400 ml-1">/ {{ product.unit }}</span>
        </div>
        <button
          v-if="product.stock > 0"
          class="text-xs bg-brand-500 hover:bg-brand-400 text-white px-3 py-1.5 rounded-lg font-semibold transition-all active:scale-95 shadow-sm shadow-brand-500/20"
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
  product: { type: Object, required: true },
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
