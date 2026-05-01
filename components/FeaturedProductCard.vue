<template>
  <NuxtLink
    :to="`/product/${product.id}`"
    class="group shrink-0 w-44 sm:w-48 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-zinc-100 hover:border-zinc-200 transition-all duration-200 flex flex-col snap-start"
  >
    <!-- Image -->
    <div class="relative aspect-square bg-zinc-50 overflow-hidden">
      <img
        :src="product.imageUrl"
        :alt="product.name"
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300"
        @error="$event.target.src = 'https://picsum.photos/seed/' + product.id + '/200/200'"
      />
      <!-- Number badge -->
      <div
        v-if="index !== undefined"
        class="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-[#3b5323] text-white text-[11px] font-black flex items-center justify-center shadow-md"
      >
        {{ index + 1 }}
      </div>
      <!-- Stock overlays -->
      <div v-if="product.stock === 0" class="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
        <span class="text-[10px] font-bold text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded-full shadow-sm">Out of stock</span>
      </div>
      <div v-else-if="product.stock < 10" class="absolute top-2 right-2">
        <span class="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow">{{ product.stock }} left</span>
      </div>
    </div>

    <!-- Card body -->
    <div class="p-3 flex flex-col gap-2.5 flex-1">
      <div class="flex-1 min-w-0">
        <p v-if="product.brand" class="text-[10px] text-zinc-400 uppercase tracking-wide truncate mb-0.5">{{ product.brand }}</p>
        <h3 class="text-sm font-semibold text-zinc-900 line-clamp-2 leading-snug">{{ product.name }}</h3>
        <p class="text-sm font-bold text-zinc-900 mt-2">ETB {{ Number(product.price).toFixed(0) }}</p>
      </div>
      <button
        v-if="product.stock > 0"
        class="w-full bg-[#1d72b8] hover:bg-[#155f9c] active:scale-[0.97] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm"
        @click.prevent.stop="handleAdd"
      >
        Add to Cart
      </button>
      <div v-else class="w-full text-center text-[11px] text-zinc-400 py-2 bg-zinc-50 rounded-xl">
        Out of stock
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  product: { type: Object, required: true },
  index: { type: Number, default: undefined },
})
const cartStore = useCartStore()
function handleAdd() {
  cartStore.addItem({ id: props.product.id, name: props.product.name, price: props.product.price, imageUrl: props.product.imageUrl })
}
</script>
