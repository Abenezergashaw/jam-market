<template>
  <div class="max-w-2xl mx-auto px-4 py-8 sm:py-10">
    <h1 class="text-2xl font-bold text-zinc-50 mb-7 tracking-tight">Your Cart</h1>

    <!-- Empty state -->
    <div v-if="cartStore.isEmpty" class="text-center py-20">
      <div class="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 6.53A1 1 0 007.63 21h8.74a1 1 0 00.98-1.22L16 13M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
      </div>
      <p class="text-zinc-400 mb-5">Your cart is empty.</p>
      <NuxtLink to="/" class="btn-primary">Browse products</NuxtLink>
    </div>

    <template v-else>
      <!-- Cart items -->
      <ul class="space-y-2 mb-7">
        <li v-for="item in cartStore.items" :key="item.id" class="card p-3 flex items-center gap-3">
          <img
            :src="item.imageUrl"
            :alt="item.name"
            class="w-14 h-14 object-cover rounded-xl bg-zinc-800 shrink-0"
            loading="lazy"
            @error="$event.target.src = 'https://picsum.photos/56/56'"
          />

          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-zinc-100 truncate">{{ item.name }}</p>
            <p class="text-sm text-brand-400 font-semibold mt-0.5">${{ Number(item.price).toFixed(2) }}</p>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button
              class="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors text-lg leading-none"
              @click="cartStore.updateQty(item.id, item.quantity - 1)"
            >−</button>
            <span class="w-6 text-center text-sm font-semibold text-zinc-100">{{ item.quantity }}</span>
            <button
              class="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors text-lg leading-none"
              @click="cartStore.updateQty(item.id, item.quantity + 1)"
            >+</button>
          </div>

          <p class="text-sm font-bold text-zinc-100 w-16 text-right shrink-0">
            ${{ (Number(item.price) * item.quantity).toFixed(2) }}
          </p>

          <button
            class="text-zinc-600 hover:text-red-400 transition-colors shrink-0"
            @click="cartStore.removeItem(item.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </li>
      </ul>

      <!-- Checkout form -->
      <div v-if="!placedOrder" class="card p-5 sm:p-6 space-y-5">
        <h2 class="font-semibold text-zinc-100">Delivery details</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label">Full name *</label>
            <input v-model="form.customerName" type="text" class="input" placeholder="Your name" required />
          </div>
          <div>
            <label class="label">Phone *</label>
            <input v-model="form.phone" type="tel" class="input" placeholder="+1 555 0100" required />
          </div>
        </div>

        <div>
          <label class="label">Delivery address *</label>
          <input v-model="form.address" type="text" class="input" placeholder="Street, city, postcode" required />
        </div>

        <div>
          <label class="label">Order notes</label>
          <input v-model="form.notes" type="text" class="input" placeholder="Leave at door, ring bell, etc." />
        </div>

        <div class="border-t border-zinc-800 pt-4 flex items-center justify-between gap-4">
          <div class="text-sm text-zinc-400">
            <span>{{ cartStore.totalItems }} item{{ cartStore.totalItems !== 1 ? 's' : '' }}</span>
            <span class="mx-2 text-zinc-700">|</span>
            <span class="font-bold text-zinc-100 text-base">${{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>
          <button
            class="btn-primary shrink-0"
            :disabled="placing || !form.customerName || !form.phone || !form.address"
            @click="placeOrder"
          >
            {{ placing ? 'Placing...' : 'Place Order' }}
          </button>
        </div>

        <p v-if="orderError" class="text-sm text-red-400">{{ orderError }}</p>
      </div>

      <!-- Success state -->
      <div v-else class="card p-8 text-center">
        <div class="w-14 h-14 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-lg font-bold text-zinc-50 mb-1">Order placed!</h2>
        <p class="text-zinc-500 text-xs mb-1">Order #{{ placedOrder.id }}</p>
        <p class="text-zinc-400 text-sm mb-6">We'll prepare your order and deliver it soon.</p>
        <div class="flex gap-3 justify-center">
          <NuxtLink to="/orders" class="btn-secondary">My Orders</NuxtLink>
          <NuxtLink to="/" class="btn-primary">Continue shopping</NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
const cartStore = useCartStore()
const myOrdersStore = useCustomerOrdersStore()

const form = reactive({ customerName: '', phone: '', address: '', notes: '' })
const placing = ref(false)
const orderError = ref('')
const placedOrder = ref(null)

async function placeOrder() {
  placing.value = true
  orderError.value = ''

  try {
    const order = await $fetch('/api/orders', {
      method: 'POST',
      body: {
        customerName: form.customerName,
        phone: form.phone,
        address: form.address,
        notes: form.notes,
        items: cartStore.items.map((i) => ({ productId: i.id, quantity: i.quantity })),
      },
    })
    myOrdersStore.addOrder(order)
    cartStore.clear()
    placedOrder.value = order
  } catch (e) {
    orderError.value = e?.data?.statusMessage ?? 'Failed to place order. Please try again.'
  } finally {
    placing.value = false
  }
}

useHead({ title: 'Cart — Jam Store' })
</script>
