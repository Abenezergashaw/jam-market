<template>
  <div class="relative w-full" @keydown="handleKeydown">
    <div class="relative">
      <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
      </svg>
      <input
        ref="inputRef"
        v-model="query"
        type="search"
        placeholder="Search products..."
        autocomplete="off"
        class="w-full h-9 pl-9 pr-3 text-sm bg-zinc-100 rounded-xl border-0 outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition-all placeholder-zinc-400"
        @focus="open = true"
        @blur="handleBlur"
      />
    </div>

    <Transition name="dropdown">
      <div
        v-if="open && query.length >= 2"
        class="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-zinc-200 shadow-xl shadow-zinc-200/80 z-50 overflow-hidden max-h-96 overflow-y-auto"
      >
        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="w-5 h-5 border-2 border-zinc-200 border-t-brand-500 rounded-full animate-spin" />
        </div>

        <!-- Empty -->
        <div v-else-if="!loading && products.length === 0 && categories.length === 0" class="py-8 text-center text-sm text-zinc-400">
          No results for "{{ query }}"
        </div>

        <template v-else>
          <!-- Categories -->
          <div v-if="categories.length > 0">
            <p class="px-4 pt-3 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Categories</p>
            <button
              v-for="(cat, i) in categories"
              :key="cat.id"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
              :class="activeIdx === i ? 'bg-zinc-50' : 'hover:bg-zinc-50'"
              @mousedown.prevent="goToCategory(cat)"
            >
              <img :src="cat.imageUrl" :alt="cat.name" class="w-8 h-8 rounded-lg object-cover shrink-0 bg-zinc-100" @error="$event.target.style.display='none'" />
              <span class="text-sm font-medium text-zinc-800 flex-1 truncate">{{ cat.name }}</span>
              <span class="text-[10px] text-zinc-400 font-medium shrink-0">Category</span>
            </button>
          </div>

          <!-- Products -->
          <div v-if="products.length > 0">
            <p class="px-4 pt-3 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Products</p>
            <button
              v-for="(product, i) in products"
              :key="product.id"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
              :class="activeIdx === categories.length + i ? 'bg-zinc-50' : 'hover:bg-zinc-50'"
              @mousedown.prevent="goToProduct(product)"
            >
              <img :src="product.imageUrl" :alt="product.name" class="w-10 h-10 rounded-lg object-cover shrink-0 bg-zinc-100" @error="$event.target.src = 'https://picsum.photos/seed/' + product.id + '/80/80'" />
              <div class="flex-1 min-w-0">
                <p v-if="product.brand" class="text-[10px] text-zinc-400 font-medium truncate">{{ product.brand }}</p>
                <p class="text-sm font-medium text-zinc-800 truncate">{{ product.name }}</p>
              </div>
              <span class="text-sm font-bold text-brand-600 shrink-0">ETB {{ Number(product.price).toFixed(0) }}</span>
            </button>
          </div>

          <!-- See all -->
          <button
            class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors border-t border-zinc-100 mt-1"
            :class="activeIdx === flatList.length ? 'bg-brand-50' : ''"
            @mousedown.prevent="goToSearch"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
            See all results for "{{ query }}"
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup>
const query = ref('')
const open = ref(false)
const products = ref([])
const categories = ref([])
const loading = ref(false)
const activeIdx = ref(-1)
const inputRef = ref(null)

let debounceTimer = null

watch(query, (val) => {
  activeIdx.value = -1
  clearTimeout(debounceTimer)
  if (val.length < 2) {
    products.value = []
    categories.value = []
    loading.value = false
    return
  }
  loading.value = true
  debounceTimer = setTimeout(async () => {
    try {
      const data = await $fetch('/api/products/search', { query: { q: val } })
      products.value = data.products.slice(0, 6)
      categories.value = data.categories.slice(0, 3)
    } catch {
      products.value = []
      categories.value = []
    } finally {
      loading.value = false
    }
  }, 300)
})

const flatList = computed(() => [
  ...categories.value.map(c => ({ type: 'category', item: c })),
  ...products.value.map(p => ({ type: 'product', item: p })),
])

function handleKeydown(e) {
  if (!open.value) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIdx.value = Math.min(activeIdx.value + 1, flatList.value.length)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIdx.value = Math.max(activeIdx.value - 1, -1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (activeIdx.value >= 0 && activeIdx.value < flatList.value.length) {
      const sel = flatList.value[activeIdx.value]
      if (sel.type === 'category') goToCategory(sel.item)
      else goToProduct(sel.item)
    } else {
      goToSearch()
    }
  } else if (e.key === 'Escape') {
    open.value = false
    inputRef.value?.blur()
  }
}

function handleBlur() {
  setTimeout(() => { open.value = false }, 150)
}

function goToCategory(cat) {
  navigateTo(`/category/${cat.id}`)
  close()
}

function goToProduct(product) {
  navigateTo(`/product/${product.id}`)
  close()
}

function goToSearch() {
  navigateTo(`/search?q=${encodeURIComponent(query.value)}`)
  close()
}

function close() {
  open.value = false
  query.value = ''
  activeIdx.value = -1
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
