<template>
  <NuxtLink
    :to="`/product/${product.id}`"
    class="group bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200 transition-all duration-200 flex flex-col"
  >
    <!-- Image -->
    <div class="aspect-square overflow-hidden bg-zinc-50 shrink-0 relative">
      <ProductImage
        :src="product.imageUrl"
        :alt="product.name"
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
      />
      <div v-if="product.stock === 0" class="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center">
        <span class="text-xs font-semibold text-zinc-500 bg-white px-3 py-1 rounded-full border border-zinc-200 shadow-sm">{{ $t('product.outOfStock') }}</span>
      </div>
      <div v-else-if="product.stock < 10" class="absolute top-2 right-2">
        <span class="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow">{{ $t('product.left', { n: product.stock }) }}</span>
      </div>
      <div v-if="product.images?.length > 0" class="absolute bottom-2 right-2 flex items-center gap-0.5">
        <span v-for="i in Math.min(product.images.length + 1, 4)" :key="i" class="w-1 h-1 rounded-full bg-white/60" />
      </div>
    </div>

    <!-- Content -->
    <div class="p-3 sm:p-3.5 flex flex-col flex-1 gap-3">
      <div class="flex-1">
        <p v-if="product.brand" class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-0.5">{{ product.brand }}</p>
        <h3 class="text-sm font-semibold text-zinc-900 leading-snug line-clamp-2">{{ product.name }}</h3>
        <p v-if="product.sku" class="text-[10px] text-zinc-400 mt-0.5">#{{ product.sku }}</p>
      </div>

      <div class="flex items-center justify-between gap-2">
        <div>
          <span class="text-sm font-bold text-zinc-900">ETB {{ Number(product.price).toFixed(0) }}</span>
          <span v-if="product.unit" class="text-[10px] text-zinc-400 ml-1">/ {{ product.unit }}</span>
        </div>
        <button
          v-if="product.stock > 0"
          class="shrink-0 text-xs bg-[#1d72b8] hover:bg-[#155f9c] active:scale-95 text-white px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm"
          @click.prevent.stop="handleAdd"
        >
          {{ $t('product.add') }}
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
