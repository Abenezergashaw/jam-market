<template>
  <NuxtLink
    :to="`/product/${product.id}`"
    class="group relative overflow-hidden rounded-2xl bg-zinc-100 block aspect-[4/3] snap-start border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all duration-300"
  >
    <img
      :src="product.imageUrl"
      :alt="product.name"
      loading="lazy"
      class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      @error="$event.target.src = 'https://picsum.photos/seed/' + product.id + '/400/300'"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

    <div class="absolute top-3 left-3">
      <span class="inline-flex items-center gap-1 bg-brand-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-brand-500/30 uppercase tracking-wider">
        ★ Featured
      </span>
    </div>

    <div v-if="product.stock === 0" class="absolute top-3 right-3">
      <span class="badge badge-red text-[10px]">Out of stock</span>
    </div>
    <div v-else-if="product.stock < 10" class="absolute top-3 right-3">
      <span class="badge badge-yellow text-[10px]">{{ product.stock }} left</span>
    </div>

    <div class="absolute bottom-0 inset-x-0 p-3 sm:p-4">
      <p v-if="product.brand" class="text-[10px] font-semibold text-brand-300 uppercase tracking-wider mb-0.5">{{ product.brand }}</p>
      <h3 class="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">{{ product.name }}</h3>
      <div class="flex items-center justify-between gap-2 mt-2">
        <span class="text-base font-bold text-white">${{ Number(product.price).toFixed(2) }}</span>
        <button
          v-if="product.stock > 0"
          class="text-xs bg-brand-500 hover:bg-brand-400 text-white px-3 py-1.5 rounded-lg font-semibold transition-all active:scale-95 shadow-lg shadow-brand-500/30"
          @click.prevent.stop="handleAdd"
        >
          Add
        </button>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({ product: { type: Object, required: true } })
const cartStore = useCartStore()
function handleAdd() {
  cartStore.addItem({ id: props.product.id, name: props.product.name, price: props.product.price, imageUrl: props.product.imageUrl })
}
</script>
