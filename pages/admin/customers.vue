<template>
  <div class="space-y-5">

    <!-- Stats row -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
        <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total Customers</p>
        <p class="text-2xl font-bold text-zinc-900 mt-1.5">{{ stats?.total ?? '—' }}</p>
        <p class="text-xs text-zinc-400 mt-0.5">All time</p>
      </div>
      <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all">
        <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">New This Month</p>
        <p class="text-2xl font-bold text-forest-500 mt-1.5">{{ stats?.newThisMonth ?? '—' }}</p>
        <p class="text-xs text-zinc-400 mt-0.5">Joined this month</p>
      </div>
      <div class="card p-4 hover:border-zinc-300 hover:shadow-sm transition-all col-span-2 sm:col-span-1">
        <p class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Active (30 days)</p>
        <p class="text-2xl font-bold text-blue-600 mt-1.5">{{ stats?.active ?? '—' }}</p>
        <p class="text-xs text-zinc-400 mt-0.5">Ordered in last 30 days</p>
      </div>
    </div>

    <!-- Search + sort -->
    <div class="flex flex-col sm:flex-row gap-2">
      <div class="relative flex-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
        </svg>
        <input
          v-model="search"
          class="input pl-9"
          placeholder="Search by name, phone, or @username…"
          @input="onSearch"
        />
      </div>
      <select v-model="sort" class="input w-auto text-sm py-2 px-3 sm:w-44" @change="fetch">
        <option value="orders">Most Orders</option>
        <option value="spent">Most Spent</option>
        <option value="active">Recently Active</option>
        <option value="new">Newest Members</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-2">
      <div v-for="n in 8" :key="n" class="card h-16 animate-pulse bg-zinc-100" />
    </div>

    <!-- Empty -->
    <div v-else-if="!customers.length" class="card p-14 text-center text-zinc-400 text-sm">
      {{ search ? `No customers matching "${search}"` : 'No customers yet.' }}
    </div>

    <!-- Customer table -->
    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100">
              <th class="text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-4 py-3">Customer</th>
              <th class="text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Phone</th>
              <th class="text-right text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-4 py-3">Orders</th>
              <th class="text-right text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Spent</th>
              <th class="text-right text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Last Order</th>
              <th class="text-right text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Joined</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-50">
            <tr
              v-for="c in customers"
              :key="c.id"
              class="hover:bg-zinc-50 transition-colors"
            >
              <td class="px-4 py-3 cursor-pointer" @click="openCustomer(c)">
                <div class="flex items-center gap-2.5">
                  <div class="relative shrink-0">
                    <img v-if="c.photoUrl" :src="c.photoUrl" class="w-8 h-8 rounded-full object-cover" />
                    <div v-else class="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-[11px] font-bold text-zinc-600">
                      {{ c.firstName[0] }}{{ c.lastName?.[0] ?? '' }}
                    </div>
                    <span v-if="c.isActive" class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" title="Active in last 30 days" />
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-zinc-900 truncate leading-tight">{{ c.firstName }} {{ c.lastName ?? '' }}</p>
                    <p v-if="c.username" class="text-[11px] text-zinc-400 leading-tight">@{{ c.username }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-zinc-500 hidden sm:table-cell cursor-pointer" @click="openCustomer(c)">{{ c.phone ?? '—' }}</td>
              <td class="px-4 py-3 text-right cursor-pointer" @click="openCustomer(c)">
                <span class="font-bold text-zinc-900">{{ c.totalOrders }}</span>
              </td>
              <td class="px-4 py-3 text-right hidden md:table-cell cursor-pointer" @click="openCustomer(c)">
                <span class="font-semibold text-zinc-700">ETB {{ c.totalSpent.toFixed(0) }}</span>
              </td>
              <td class="px-4 py-3 text-right text-zinc-400 text-xs hidden lg:table-cell cursor-pointer" @click="openCustomer(c)">
                {{ c.lastOrderAt ? formatDate(c.lastOrderAt) : '—' }}
              </td>
              <td class="px-4 py-3 text-right text-zinc-400 text-xs hidden lg:table-cell cursor-pointer" @click="openCustomer(c)">
                {{ formatDate(c.createdAt) }}
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  class="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete customer"
                  @click.stop="confirmDelete(c)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-zinc-100">
        <button class="btn-secondary text-xs px-3 py-1.5" :disabled="page === 1" @click="changePage(page - 1)">← Previous</button>
        <span class="text-xs text-zinc-400">Page {{ page }} of {{ totalPages }}</span>
        <button class="btn-secondary text-xs px-3 py-1.5" :disabled="page === totalPages" @click="changePage(page + 1)">Next →</button>
      </div>
    </div>

    <!-- Delete confirm modal -->
    <Transition name="sheet">
      <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center px-4" @click.self="deleteTarget = null">
        <div class="absolute inset-0 bg-black/30" @click="deleteTarget = null" />
        <div class="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <p class="font-bold text-zinc-900">Delete customer?</p>
              <p class="text-sm text-zinc-500">{{ deleteTarget.firstName }} {{ deleteTarget.lastName ?? '' }}</p>
            </div>
          </div>
          <p class="text-sm text-zinc-600 mb-5">This will permanently delete the account and all associated data. This cannot be undone.</p>
          <p v-if="deleteError" class="text-xs text-red-500 mb-3">{{ deleteError }}</p>
          <div class="flex gap-2">
            <button class="flex-1 btn-secondary text-sm" :disabled="deleting" @click="deleteTarget = null">Cancel</button>
            <button class="flex-1 btn text-sm bg-red-500 text-white hover:bg-red-600 active:scale-[0.97]" :disabled="deleting" @click="doDelete">
              {{ deleting ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Customer detail drawer -->
    <Transition name="sheet">
      <div v-if="drawer" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center" @click.self="drawer = null">
        <div class="absolute inset-0 bg-black/30" @click="drawer = null" />
        <div class="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">

          <!-- Header -->
          <div class="sticky top-0 bg-white px-5 pt-5 pb-4 border-b border-zinc-100">
            <div class="flex items-center gap-3">
              <img v-if="drawer.customer?.photoUrl" :src="drawer.customer.photoUrl" class="w-12 h-12 rounded-full object-cover shrink-0" />
              <div v-else class="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center text-base font-bold text-zinc-600 shrink-0">
                {{ drawer.customer?.firstName[0] }}{{ drawer.customer?.lastName?.[0] ?? '' }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-zinc-900">{{ drawer.customer?.firstName }} {{ drawer.customer?.lastName ?? '' }}</p>
                <p class="text-xs text-zinc-400">
                  <template v-if="drawer.customer?.username">@{{ drawer.customer.username }} · </template>
                  {{ drawer.customer?.phone ?? 'No phone' }} · Member since {{ formatDateShort(drawer.customer?.createdAt) }}
                </p>
              </div>
              <button class="text-zinc-400 hover:text-zinc-700 p-1 shrink-0" @click="drawer = null">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <!-- Quick stats -->
            <div class="grid grid-cols-3 gap-2 mt-3">
              <div class="bg-zinc-50 rounded-xl p-3 text-center">
                <p class="text-lg font-bold text-zinc-900">{{ drawerCustomerRow?.totalOrders ?? 0 }}</p>
                <p class="text-[10px] text-zinc-400 uppercase tracking-wide">Orders</p>
              </div>
              <div class="bg-zinc-50 rounded-xl p-3 text-center">
                <p class="text-lg font-bold text-zinc-900">ETB {{ (drawerCustomerRow?.totalSpent ?? 0).toFixed(0) }}</p>
                <p class="text-[10px] text-zinc-400 uppercase tracking-wide">Spent</p>
              </div>
              <div class="bg-zinc-50 rounded-xl p-3 text-center">
                <p class="text-lg font-bold" :class="drawerCustomerRow?.isActive ? 'text-green-600' : 'text-zinc-400'">{{ drawerCustomerRow?.isActive ? 'Active' : 'Inactive' }}</p>
                <p class="text-[10px] text-zinc-400 uppercase tracking-wide">Status</p>
              </div>
            </div>
          </div>

          <!-- Orders list -->
          <div class="p-5">
            <p class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Recent Orders</p>
            <div v-if="drawerLoading" class="space-y-2">
              <div v-for="n in 3" :key="n" class="h-14 rounded-xl bg-zinc-100 animate-pulse" />
            </div>
            <div v-else-if="!drawer.orders?.length" class="text-sm text-zinc-400 text-center py-6">No orders yet.</div>
            <div v-else class="space-y-2">
              <NuxtLink
                v-for="order in drawer.orders"
                :key="order.id"
                :to="`/admin/orders/${order.id}`"
                class="block p-3 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
                @click="drawer = null"
              >
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-zinc-900 font-mono">#{{ order.id }}</span>
                    <span :class="statusBadge(order.status)">{{ statusLabel(order.status) }}</span>
                  </div>
                  <span class="text-xs font-semibold text-zinc-700">ETB {{ Number(order.totalPrice).toFixed(0) }}</span>
                </div>
                <div class="flex items-center justify-between gap-2 mt-1">
                  <p class="text-[11px] text-zinc-400 truncate">{{ order.items.map(i => i.product?.name).filter(Boolean).join(', ') }}</p>
                  <p class="text-[11px] text-zinc-400 shrink-0">{{ formatDate(order.createdAt) }}</p>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin', ssr: false })

const { adminFetch } = useAdminFetch()

const customers = ref([])
const stats = ref(null)
const loading = ref(true)
const search = ref('')
const sort = ref('orders')
const page = ref(1)
const totalPages = ref(1)
const drawer = ref(null)
const drawerLoading = ref(false)
const drawerCustomerRow = ref(null)
const deleteTarget = ref(null)
const deleting = ref(false)
const deleteError = ref('')

let searchTimer = null

const STATUS = {
  PENDING:          { label: 'Pending',          cls: 'badge badge-yellow' },
  CONFIRMED:        { label: 'Confirmed',         cls: 'badge badge-blue' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',  cls: 'badge badge-orange' },
  DELIVERED:        { label: 'Delivered',         cls: 'badge badge-green' },
  CANCELLED:        { label: 'Cancelled',         cls: 'badge badge-red' },
}
function statusLabel(s) { return STATUS[s]?.label ?? s }
function statusBadge(s) { return STATUS[s]?.cls ?? 'badge' }

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function formatDateShort(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

async function fetch() {
  loading.value = true
  try {
    const res = await adminFetch('/api/admin/customers', {
      query: { search: search.value, sort: sort.value, page: page.value },
    })
    stats.value = res.stats
    customers.value = res.customers
    totalPages.value = res.totalPages
  } catch {}
  finally { loading.value = false }
}

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    fetch()
  }, 300)
}

function changePage(p) {
  page.value = p
  fetch()
}

function confirmDelete(row) {
  deleteTarget.value = row
  deleteError.value = ''
}

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await adminFetch(`/api/admin/customers/${deleteTarget.value.id}`, { method: 'DELETE' })
    customers.value = customers.value.filter(c => c.id !== deleteTarget.value.id)
    if (stats.value) stats.value = { ...stats.value, total: stats.value.total - 1 }
    deleteTarget.value = null
  } catch (e) {
    deleteError.value = e?.data?.statusMessage ?? 'Failed to delete customer'
  } finally {
    deleting.value = false
  }
}

async function openCustomer(row) {
  drawerCustomerRow.value = row
  drawer.value = { customer: null, orders: null }
  drawerLoading.value = true
  try {
    const res = await adminFetch(`/api/admin/customers/${row.id}/orders`)
    drawer.value = res
  } catch {}
  finally { drawerLoading.value = false }
}

onMounted(fetch)
useHead({ title: 'Customers — Admin' })
</script>

<style scoped>
.sheet-enter-active, .sheet-leave-active { transition: opacity 0.2s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
</style>
