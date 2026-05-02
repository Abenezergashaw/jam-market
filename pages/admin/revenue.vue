<template>
  <div class="space-y-5 max-w-7xl">

    <!-- Date range filter -->
    <div class="card p-4 flex flex-wrap items-center gap-3">
      <div class="flex gap-1.5 flex-wrap">
        <button
          v-for="p in presets"
          :key="p.label"
          class="text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150"
          :class="activePreset === p.label
            ? 'bg-brand-500 text-white shadow-sm'
            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
          @click="applyPreset(p)"
        >
          {{ p.label }}
        </button>
      </div>
      <div class="flex items-center gap-2 ml-auto flex-wrap">
        <input v-model="fromDate" type="date" class="input text-sm py-1.5 w-36" @change="activePreset = 'Custom'" />
        <span class="text-zinc-400 text-sm">—</span>
        <input v-model="toDate" type="date" class="input text-sm py-1.5 w-36" @change="activePreset = 'Custom'" />
        <button class="btn-primary text-sm px-4 py-1.5" :disabled="loading" @click="fetchRevenue">
          {{ loading ? 'Loading…' : 'Apply' }}
        </button>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-5">
      <div class="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div v-for="n in 6" :key="n" class="card h-20 animate-pulse bg-zinc-100" />
      </div>
      <div class="card h-28 animate-pulse bg-zinc-100" />
      <div class="card h-48 animate-pulse bg-zinc-100" />
      <div class="card h-64 animate-pulse bg-zinc-100" />
    </div>

    <template v-else-if="data">

      <!-- KPI cards -->
      <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <div class="card p-4">
          <p class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Total Revenue</p>
          <p class="text-xl font-bold text-zinc-900 truncate">ETB {{ fmt(data.totals.revenue) }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">{{ data.counts.total }} orders</p>
        </div>
        <div class="card p-4">
          <p class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Delivery Fees</p>
          <p class="text-xl font-bold text-zinc-900 truncate">ETB {{ fmt(data.totals.deliveryFee) }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Travel fee collected</p>
        </div>
        <div class="card p-4">
          <p class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Service Charge</p>
          <p class="text-xl font-bold text-zinc-900 truncate">ETB {{ fmt(data.totals.serviceCharge) }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">Platform fee</p>
        </div>
        <div class="card p-4">
          <p class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Items Revenue</p>
          <p class="text-xl font-bold text-zinc-900 truncate">ETB {{ fmt(data.totals.itemsRevenue) }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">After fees</p>
        </div>
        <div class="card p-4">
          <p class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Cost of Goods</p>
          <p class="text-xl font-bold text-zinc-900 truncate">ETB {{ fmt(data.totals.cogs) }}</p>
          <p class="text-xs text-zinc-400 mt-0.5">COGS</p>
        </div>
        <div class="card p-4 border-green-200 bg-green-50/60">
          <p class="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-1">Gross Profit</p>
          <p class="text-xl font-bold text-green-700 truncate">ETB {{ fmt(data.totals.grossProfit) }}</p>
          <p class="text-xs text-green-500 mt-0.5">{{ margin }}% margin</p>
        </div>
      </div>

      <!-- Cancellations & Refunds -->
      <div class="card p-5">
        <div class="flex items-center justify-between gap-4 flex-wrap mb-4">
          <h2 class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cancellations & Refunds</h2>
          <span v-if="data.refunds.pendingCount > 0" class="badge badge-yellow text-xs">
            {{ data.refunds.pendingCount }} refund{{ data.refunds.pendingCount !== 1 ? 's' : '' }} pending
          </span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3 rounded-xl bg-red-50 border border-red-100 text-center">
            <p class="text-2xl font-bold text-red-700">{{ data.counts.cancelled }}</p>
            <p class="text-xs text-red-500 mt-0.5">Cancelled orders</p>
          </div>
          <div class="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
            <p class="text-2xl font-bold text-amber-700">{{ data.refunds.pendingCount }}</p>
            <p class="text-xs text-amber-500 mt-0.5">Refund pending</p>
          </div>
          <div class="p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-center">
            <p class="text-2xl font-bold text-zinc-700">{{ data.refunds.refundedCount }}</p>
            <p class="text-xs text-zinc-500 mt-0.5">Refunded</p>
          </div>
          <div class="p-3 rounded-xl bg-red-50 border border-red-100 text-center">
            <p class="text-lg font-bold text-red-700 truncate">ETB {{ fmt(data.refunds.refundedTotal) }}</p>
            <p class="text-xs text-red-500 mt-0.5">Total refunded</p>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between gap-4 flex-wrap">
          <span class="text-xs text-zinc-500">Gross profit after refunds</span>
          <span class="text-sm font-bold" :class="netAfterRefunds >= 0 ? 'text-green-600' : 'text-red-500'">
            ETB {{ fmt(netAfterRefunds) }}
          </span>
        </div>
      </div>

      <!-- Order status breakdown -->
      <div class="card p-5">
        <h2 class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Orders by Status</h2>
        <div class="grid grid-cols-3 lg:grid-cols-6 gap-3">
          <div class="text-center p-3 rounded-xl bg-zinc-50 border border-zinc-100">
            <p class="text-2xl font-bold text-zinc-900">{{ data.counts.total }}</p>
            <p class="text-xs text-zinc-500 mt-0.5">Total</p>
          </div>
          <div class="text-center p-3 rounded-xl bg-amber-50 border border-amber-100">
            <p class="text-2xl font-bold text-amber-700">{{ data.counts.pending }}</p>
            <p class="text-xs text-amber-600 mt-0.5">Pending</p>
          </div>
          <div class="text-center p-3 rounded-xl bg-blue-50 border border-blue-100">
            <p class="text-2xl font-bold text-blue-700">{{ data.counts.confirmed }}</p>
            <p class="text-xs text-blue-600 mt-0.5">Confirmed</p>
          </div>
          <div class="text-center p-3 rounded-xl bg-orange-50 border border-orange-100">
            <p class="text-2xl font-bold text-orange-700">{{ data.counts.outForDelivery }}</p>
            <p class="text-xs text-orange-600 mt-0.5">Out for Delivery</p>
          </div>
          <div class="text-center p-3 rounded-xl bg-green-50 border border-green-100">
            <p class="text-2xl font-bold text-green-700">{{ data.counts.delivered }}</p>
            <p class="text-xs text-green-600 mt-0.5">Delivered</p>
          </div>
          <div class="text-center p-3 rounded-xl bg-red-50 border border-red-100">
            <p class="text-2xl font-bold text-red-700">{{ data.counts.cancelled }}</p>
            <p class="text-xs text-red-600 mt-0.5">Cancelled</p>
          </div>
        </div>
      </div>

      <!-- Payment method breakdown -->
      <div v-if="data.paymentBreakdown" class="card p-5">
        <h2 class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Revenue by Payment Method</h2>
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <!-- Cash -->
          <div class="p-4 rounded-xl bg-green-50 border border-green-100">
            <p class="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-1">Cash</p>
            <p class="text-lg font-bold text-green-800 truncate">ETB {{ fmt(data.paymentBreakdown.cash.revenue) }}</p>
            <p class="text-xs text-green-500 mt-0.5">{{ data.paymentBreakdown.cash.count }} orders</p>
          </div>
          <!-- Online total -->
          <div class="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <p class="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-1">Online (total)</p>
            <p class="text-lg font-bold text-blue-800 truncate">ETB {{ fmt(data.paymentBreakdown.online.revenue) }}</p>
            <p class="text-xs text-blue-500 mt-0.5">{{ data.paymentBreakdown.online.count }} orders</p>
          </div>
          <!-- Per-bank -->
          <div
            v-for="(entry, key) in data.paymentBreakdown.byMethod"
            :key="key"
            class="p-4 rounded-xl bg-zinc-50 border border-zinc-100"
          >
            <p class="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">{{ key.toUpperCase() }}</p>
            <p class="text-lg font-bold text-zinc-800 truncate">ETB {{ fmt(entry.revenue) }}</p>
            <p class="text-xs text-zinc-400 mt-0.5">{{ entry.count }} orders</p>
          </div>
        </div>
      </div>

      <!-- Daily breakdown -->
      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Daily Breakdown</h2>
          <label class="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer select-none">
            <input v-model="showAllDays" type="checkbox" class="rounded" />
            Show zero-revenue days
          </label>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm min-w-[680px]">
            <thead>
              <tr class="border-b border-zinc-100">
                <th class="text-left py-2 pr-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</th>
                <th class="text-right py-2 px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Orders</th>
                <th class="text-right py-2 px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Revenue</th>
                <th class="text-right py-2 px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Delivery</th>
                <th class="text-right py-2 px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Svc Chg</th>
                <th class="text-right py-2 px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Items</th>
                <th class="text-right py-2 px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">COGS</th>
                <th class="text-right py-2 pl-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Profit</th>
                <th class="w-6"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-50">
              <tr
                v-for="day in filteredDays"
                :key="day.date"
                class="hover:bg-brand-50/40 transition-colors"
                :class="[day.orders === 0 ? 'opacity-40 cursor-default' : 'cursor-pointer', selectedDay === day.date ? 'bg-brand-50/60' : '']"
                @click="day.orders > 0 && toggleDay(day.date)"
              >
                <td class="py-2.5 pr-4 text-zinc-600 font-mono text-xs">{{ formatDay(day.date) }}</td>
                <td class="py-2.5 px-3 text-right text-zinc-700">{{ day.orders }}</td>
                <td class="py-2.5 px-3 text-right font-medium text-zinc-900">{{ fmt(day.revenue) }}</td>
                <td class="py-2.5 px-3 text-right text-zinc-500">{{ fmt(day.deliveryFee) }}</td>
                <td class="py-2.5 px-3 text-right text-zinc-500">{{ fmt(day.serviceCharge) }}</td>
                <td class="py-2.5 px-3 text-right text-zinc-700">{{ fmt(day.itemsRevenue) }}</td>
                <td class="py-2.5 px-3 text-right text-zinc-500">{{ fmt(day.cogs) }}</td>
                <td class="py-2.5 pl-3 text-right font-semibold" :class="day.profit >= 0 ? 'text-green-600' : 'text-red-500'">
                  {{ fmt(day.profit) }}
                </td>
                <td class="py-2.5 pl-2 w-6">
                  <svg v-if="day.orders > 0" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 transition-transform duration-150" :class="selectedDay === day.date ? 'rotate-90 text-brand-400' : 'text-zinc-300'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-zinc-200 bg-zinc-50/80">
                <td class="py-2.5 pr-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total</td>
                <td class="py-2.5 px-3 text-right font-semibold text-zinc-700">{{ data.counts.total }}</td>
                <td class="py-2.5 px-3 text-right font-bold text-zinc-900">{{ fmt(data.totals.revenue) }}</td>
                <td class="py-2.5 px-3 text-right font-semibold text-zinc-600">{{ fmt(data.totals.deliveryFee) }}</td>
                <td class="py-2.5 px-3 text-right font-semibold text-zinc-600">{{ fmt(data.totals.serviceCharge) }}</td>
                <td class="py-2.5 px-3 text-right font-semibold text-zinc-700">{{ fmt(data.totals.itemsRevenue) }}</td>
                <td class="py-2.5 px-3 text-right font-semibold text-zinc-600">{{ fmt(data.totals.cogs) }}</td>
                <td class="py-2.5 pl-3 text-right font-bold text-green-600">{{ fmt(data.totals.grossProfit) }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p v-if="filteredDays.length === 0" class="text-center py-8 text-sm text-zinc-400">
          No orders in this date range.
        </p>
      </div>

      <!-- Day orders panel -->
      <div v-if="selectedDay" class="card p-5">
        <div class="flex items-center justify-between gap-4 mb-4">
          <h2 class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Orders — {{ formatDay(selectedDay) }}
            <span class="ml-2 text-brand-500 normal-case font-bold text-sm">{{ dayOrders.length }}</span>
          </h2>
          <button class="text-xs text-zinc-400 hover:text-zinc-600 transition-colors" @click="selectedDay = null">✕ Close</button>
        </div>
        <div v-if="dayOrders.length === 0" class="text-center py-8 text-sm text-zinc-400">No orders found for this day.</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="order in dayOrders"
            :key="order.id"
            :to="`/admin/orders/${order.id}`"
            class="block p-4 rounded-xl border border-zinc-200 hover:border-brand-300 hover:bg-brand-50/30 transition-all space-y-2 bg-white"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="font-mono text-sm font-bold text-zinc-700">#{{ order.id }}</span>
              <span class="badge text-[10px]" :class="statusBadge(order.status)">{{ order.status.replace('_', ' ') }}</span>
            </div>
            <p class="text-sm font-medium text-zinc-900 truncate">{{ order.customerName }}</p>
            <p class="text-xs text-zinc-400">{{ formatTime(order.createdAt) }} · {{ order.itemCount }} item{{ order.itemCount !== 1 ? 's' : '' }}</p>
            <div class="flex items-center justify-between pt-1.5 border-t border-zinc-100">
              <span class="text-xs font-medium" :class="['CASH','COD'].includes(order.paymentMethod) ? 'text-green-600' : 'text-blue-600'">
                {{ PM_LABEL[order.paymentMethod] ?? order.paymentMethod }}
              </span>
              <span class="text-sm font-bold text-zinc-900">ETB {{ fmt(order.totalPrice) }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Receipts & Reference Codes -->
      <div v-if="ordersData && (filteredReceiptOrders.length > 0 || receiptBankOptions.length > 1)" class="card p-5">
        <div class="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <h2 class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Receipts & Reference Codes</h2>
          <div v-if="receiptBankOptions.length > 1" class="flex gap-1.5 flex-wrap">
            <button
              v-for="opt in receiptBankOptions"
              :key="opt.key"
              class="text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150"
              :class="activeReceiptBank === opt.key ? 'bg-brand-500 text-white shadow-sm' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
              @click="activeReceiptBank = opt.key"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
        <div v-if="filteredReceiptOrders.length === 0" class="text-center py-8 text-sm text-zinc-400">
          No receipts for this selection.
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <div
            v-for="order in filteredReceiptOrders"
            :key="order.id"
            class="rounded-xl border border-zinc-200 bg-white overflow-hidden hover:border-brand-200 transition-colors"
          >
            <div class="p-3 space-y-1">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <NuxtLink :to="`/admin/orders/${order.id}`" class="font-mono text-xs font-bold text-brand-600 hover:underline">#{{ order.id }}</NuxtLink>
                  <p class="text-sm font-medium text-zinc-800 mt-0.5 truncate">{{ order.customerName }}</p>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-sm font-bold text-zinc-900">ETB {{ fmt(order.totalPrice) }}</p>
                  <p class="text-[10px] text-zinc-400 mt-0.5">{{ formatTime(order.createdAt) }}</p>
                </div>
              </div>
              <span class="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full" :class="['CASH','COD'].includes(order.paymentMethod) ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'">
                {{ PM_LABEL[order.paymentMethod] ?? order.paymentMethod }}
              </span>
            </div>
            <!-- Receipt image -->
            <div
              v-if="order.receiptImageUrl"
              class="cursor-zoom-in overflow-hidden"
              @click="viewingReceipt = order.receiptImageUrl"
            >
              <CachedImage
                :src="cloudinaryThumb(order.receiptImageUrl, 400)"
                :alt="`Receipt #${order.id}`"
                class="w-full h-40 object-cover border-t border-zinc-100 hover:opacity-90 transition-opacity"
              />
            </div>
            <!-- Reference code -->
            <div v-else-if="order.paymentReferenceCode" class="mx-3 mb-3 px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-sm text-zinc-700 select-all break-all">
              {{ order.paymentReferenceCode }}
            </div>
          </div>
        </div>
      </div>

      <!-- Top products -->
      <div class="card p-5">
        <h2 class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Most Ordered Products</h2>
        <div v-if="data.topProducts.length === 0" class="text-center py-8 text-sm text-zinc-400">No data.</div>
        <ul v-else class="space-y-2">
          <li
            v-for="(product, i) in data.topProducts"
            :key="product.productId"
            class="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors"
          >
            <span class="w-6 text-center text-sm font-bold" :class="i === 0 ? 'text-amber-500' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-amber-700' : 'text-zinc-300'">
              {{ i + 1 }}
            </span>
            <img
              :src="product.imageUrl"
              :alt="product.name"
              class="w-10 h-10 rounded-xl object-cover bg-zinc-100 shrink-0"
              @error="$event.target.src = 'https://picsum.photos/40/40'"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-zinc-900 truncate">{{ product.name }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-sm font-bold text-zinc-900">{{ product.totalSold.toLocaleString() }}</p>
              <p class="text-[10px] text-zinc-400">units sold</p>
            </div>
            <!-- bar -->
            <div class="w-24 h-1.5 rounded-full bg-zinc-100 shrink-0">
              <div
                class="h-1.5 rounded-full bg-brand-400"
                :style="{ width: `${Math.round((product.totalSold / data.topProducts[0].totalSold) * 100)}%` }"
              />
            </div>
          </li>
        </ul>
      </div>

    </template>

    <div v-else class="card p-14 text-center text-sm text-zinc-400">No data loaded.</div>
  </div>

  <!-- Receipt lightbox -->
  <Teleport to="body">
    <div
      v-if="viewingReceipt"
      class="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
      @click="viewingReceipt = null"
    >
      <img :src="viewingReceipt" class="max-w-full max-h-full rounded-2xl shadow-2xl" alt="Receipt" />
      <button class="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors" @click="viewingReceipt = null">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  </Teleport>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const { adminFetch } = useAdminFetch()

function toInputDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const today = new Date()
const fromDate = ref(toInputDate(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)))
const toDate = ref(toInputDate(today))
const activePreset = ref('Last 30 days')
const showAllDays = ref(false)

const presets = [
  {
    label: 'Today',
    from: () => toInputDate(today),
    to: () => toInputDate(today),
  },
  {
    label: 'Yesterday',
    from: () => toInputDate(new Date(Date.now() - 86400000)),
    to: () => toInputDate(new Date(Date.now() - 86400000)),
  },
  {
    label: 'Last 7 days',
    from: () => toInputDate(new Date(Date.now() - 6 * 86400000)),
    to: () => toInputDate(today),
  },
  {
    label: 'Last 30 days',
    from: () => toInputDate(new Date(Date.now() - 29 * 86400000)),
    to: () => toInputDate(today),
  },
  {
    label: 'This month',
    from: () => toInputDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    to: () => toInputDate(today),
  },
  {
    label: 'Last month',
    from: () => toInputDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
    to: () => toInputDate(new Date(today.getFullYear(), today.getMonth(), 0)),
  },
]

function applyPreset(p) {
  activePreset.value = p.label
  fromDate.value = p.from()
  toDate.value = p.to()
  fetchRevenue()
}

const data = ref(null)
const loading = ref(false)
const ordersData = ref(null)
const selectedDay = ref(null)
const activeReceiptBank = ref('all')
const viewingReceipt = ref(null)

async function fetchRevenue() {
  loading.value = true
  ordersData.value = null
  selectedDay.value = null
  try {
    ;[data.value, ordersData.value] = await Promise.all([
      adminFetch(`/api/admin/revenue?from=${fromDate.value}&to=${toDate.value}`),
      adminFetch(`/api/admin/revenue/orders?from=${fromDate.value}&to=${toDate.value}`),
    ])
  } catch {}
  finally { loading.value = false }
}

const margin = computed(() => {
  if (!data.value?.totals?.revenue || data.value.totals.revenue === 0) return '0.0'
  return ((data.value.totals.grossProfit / data.value.totals.revenue) * 100).toFixed(1)
})

const netAfterRefunds = computed(() => {
  if (!data.value) return 0
  return data.value.totals.grossProfit - Number(data.value.refunds.refundedTotal)
})

const filteredDays = computed(() => {
  if (!data.value) return []
  return showAllDays.value ? data.value.revenueByDay : data.value.revenueByDay.filter((d) => d.orders > 0)
})

function fmt(n) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDay(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function statusBadge(s) {
  return { PENDING: 'badge-yellow', CONFIRMED: 'badge-blue', OUT_FOR_DELIVERY: 'badge-orange', DELIVERED: 'badge-green', CANCELLED: 'badge-red' }[s] ?? ''
}

function cloudinaryThumb(url, w = 400) {
  if (!url || !url.includes('cloudinary.com')) return url
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`)
}

function toggleDay(date) {
  selectedDay.value = selectedDay.value === date ? null : date
}

const PM_LABEL = { CASH: 'Cash', COD: 'Cash', TELEBIRR: 'Telebirr', CBE: 'CBE', BOA: 'BOA' }

const dayOrders = computed(() => {
  if (!selectedDay.value || !ordersData.value) return []
  return ordersData.value.orders.filter((o) => {
    const d = new Date(o.createdAt)
    const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return s === selectedDay.value
  })
})

const receiptBankOptions = computed(() => {
  if (!ordersData.value) return []
  const methods = new Set(
    ordersData.value.orders
      .filter((o) => (o.receiptImageUrl || o.paymentReferenceCode) && o.paymentStatus === 'COLLECTED')
      .map((o) => o.paymentMethod),
  )
  return [
    { key: 'all', label: 'All' },
    ...['TELEBIRR', 'CBE', 'BOA'].filter((m) => methods.has(m)).map((m) => ({ key: m, label: PM_LABEL[m] })),
  ]
})

const filteredReceiptOrders = computed(() => {
  if (!ordersData.value) return []
  return ordersData.value.orders.filter((o) => {
    const hasProof = o.receiptImageUrl || o.paymentReferenceCode
    const matchesBank = activeReceiptBank.value === 'all' || o.paymentMethod === activeReceiptBank.value
    return hasProof && matchesBank && o.paymentStatus === 'COLLECTED'
  })
})

onMounted(fetchRevenue)
useHead({ title: 'Revenue — Admin' })
</script>
