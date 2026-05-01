<template>
  <div class="max-w-2xl">
    <div class="mb-6">
      <NuxtLink to="/cashier/products" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-brand-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to products
      </NuxtLink>
      <h2 class="text-lg font-bold text-zinc-900 mt-3">{{ isNew ? 'New product' : 'Edit product' }}</h2>
    </div>

    <div class="card p-5 sm:p-6">
      <AdminProductForm
        :initial="product"
        :is-edit="!isNew"
        :show-cost-price="false"
        :cancel-to="'/cashier/products'"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['cashier'], layout: 'cashier', ssr: false })

const route = useRoute()
const router = useRouter()
const { adminFetch } = useAdminFetch()

const isNew = computed(() => route.params.id === 'new')
const product = ref(null)

if (!isNew.value) {
  const data = await adminFetch(`/api/products/${route.params.id}`)
  product.value = data
}

async function handleSubmit(data) {
  if (isNew.value) {
    await adminFetch('/api/products', { method: 'POST', body: data })
  } else {
    await adminFetch(`/api/products/${route.params.id}`, { method: 'PUT', body: data })
  }
  router.push('/cashier/products')
}

useHead({ title: isNew.value ? 'New Product — Cashier' : 'Edit Product — Cashier' })
</script>
