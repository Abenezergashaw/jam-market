<template>
  <div class="space-y-5 max-w-6xl">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <h1 class="text-xl font-bold text-zinc-900">Audit Log</h1>
      <span class="text-xs text-zinc-400">{{ total }} total entries</span>
    </div>

    <!-- Filters -->
    <div class="card p-4 flex flex-wrap gap-3">
      <select v-model="filters.entity" class="input text-sm w-36" @change="fetch(1)">
        <option value="">All entities</option>
        <option value="order">Orders</option>
        <option value="product">Products</option>
        <option value="category">Categories</option>
        <option value="user">Users</option>
      </select>

      <select v-model="filters.action" class="input text-sm w-52" @change="fetch(1)">
        <option value="">All actions</option>
        <optgroup label="Orders">
          <option value="ORDER_STATUS_CHANGED">Status changed</option>
          <option value="ORDER_CANCELLED">Order cancelled</option>
          <option value="ORDER_REFUNDED">Order refunded</option>
          <option value="PAYMENT_VERIFIED">Payment verified</option>
          <option value="DELIVERY_ASSIGNED">Delivery assigned</option>
        </optgroup>
        <optgroup label="Products">
          <option value="PRODUCT_CREATED">Product created</option>
          <option value="PRODUCT_UPDATED">Product updated</option>
          <option value="PRODUCT_DELETED">Product deleted</option>
          <option value="STOCK_UPDATED">Stock updated</option>
        </optgroup>
        <optgroup label="Categories">
          <option value="CATEGORY_CREATED">Category created</option>
          <option value="CATEGORY_UPDATED">Category updated</option>
          <option value="CATEGORY_DELETED">Category deleted</option>
        </optgroup>
        <optgroup label="Users">
          <option value="USER_CREATED">User created</option>
          <option value="USER_UPDATED">User updated</option>
          <option value="USER_DEACTIVATED">User deactivated</option>
        </optgroup>
      </select>

      <input v-model="filters.from" type="date" class="input text-sm w-40" @change="fetch(1)" />
      <input v-model="filters.to"   type="date" class="input text-sm w-40" @change="fetch(1)" />

      <button class="btn-secondary text-sm px-3" @click="clearFilters">Clear</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-2">
      <div v-for="n in 8" :key="n" class="card h-14 animate-pulse bg-zinc-50" />
    </div>

    <!-- Empty -->
    <div v-else-if="logs.length === 0" class="card p-12 text-center">
      <p class="text-zinc-400 text-sm">No audit entries match the current filters.</p>
    </div>

    <!-- Table -->
    <div v-else class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-zinc-50 border-b border-zinc-100">
          <tr>
            <th class="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider w-40">Time</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Who</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Action</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Entity</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Details</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider w-28">IP</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-50">
          <tr v-for="log in logs" :key="log.id" class="hover:bg-zinc-50/60 transition-colors">
            <!-- Time -->
            <td class="px-4 py-3 text-xs text-zinc-400 whitespace-nowrap">
              {{ formatDate(log.createdAt) }}
            </td>

            <!-- Who -->
            <td class="px-4 py-3">
              <p class="text-xs font-medium text-zinc-700 truncate max-w-[140px]">{{ log.userEmail ?? '—' }}</p>
              <span v-if="log.userRole" class="text-[10px] text-zinc-400 capitalize">{{ log.userRole }}</span>
            </td>

            <!-- Action badge -->
            <td class="px-4 py-3">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" :class="actionClass(log.action)">
                {{ actionLabel(log.action) }}
              </span>
            </td>

            <!-- Entity + link -->
            <td class="px-4 py-3">
              <NuxtLink
                v-if="entityLink(log)"
                :to="entityLink(log)"
                class="text-xs font-medium text-brand-600 hover:underline"
              >
                {{ log.entity }} #{{ log.entityId }}
              </NuxtLink>
              <span v-else class="text-xs text-zinc-500 capitalize">{{ log.entity }}{{ log.entityId ? ` #${log.entityId}` : '' }}</span>
            </td>

            <!-- Details -->
            <td class="px-4 py-3 text-xs text-zinc-500 max-w-xs">
              {{ formatMeta(log.action, log.meta) }}
            </td>

            <!-- IP -->
            <td class="px-4 py-3 text-xs text-zinc-400 font-mono">{{ log.ip ?? '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
      <button
        class="btn-secondary text-xs px-3 py-1.5"
        :disabled="page <= 1"
        @click="fetch(page - 1)"
      >← Prev</button>
      <span class="text-xs text-zinc-500">Page {{ page }} of {{ totalPages }}</span>
      <button
        class="btn-secondary text-xs px-3 py-1.5"
        :disabled="page >= totalPages"
        @click="fetch(page + 1)"
      >Next →</button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['admin'], layout: 'admin' })

const { adminFetch } = useAdminFetch()

const logs       = ref([])
const total      = ref(0)
const page       = ref(1)
const totalPages = ref(1)
const loading    = ref(false)

const filters = reactive({ entity: '', action: '', from: '', to: '' })

async function fetch(pageNum = 1) {
  loading.value = true
  try {
    const query = { page: pageNum }
    if (filters.entity) query.entity = filters.entity
    if (filters.action) query.action = filters.action
    if (filters.from)   query.from   = filters.from
    if (filters.to)     query.to     = filters.to

    const data = await adminFetch('/api/admin/audit', { query })
    logs.value       = data.logs
    total.value      = data.total
    page.value       = data.page
    totalPages.value = data.totalPages
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  filters.entity = ''
  filters.action = ''
  filters.from   = ''
  filters.to     = ''
  fetch(1)
}

const ACTION_META = {
  ORDER_STATUS_CHANGED: { label: 'Status changed',     cls: 'bg-blue-50 text-blue-600' },
  ORDER_CANCELLED:      { label: 'Order cancelled',    cls: 'bg-red-50 text-red-600' },
  ORDER_REFUNDED:       { label: 'Order refunded',     cls: 'bg-emerald-50 text-emerald-600' },
  PAYMENT_VERIFIED:     { label: 'Payment verified',   cls: 'bg-green-50 text-green-600' },
  DELIVERY_ASSIGNED:    { label: 'Delivery assigned',  cls: 'bg-purple-50 text-purple-600' },
  PRODUCT_CREATED:      { label: 'Product created',    cls: 'bg-emerald-50 text-emerald-600' },
  PRODUCT_UPDATED:      { label: 'Product updated',    cls: 'bg-amber-50 text-amber-600' },
  PRODUCT_DELETED:      { label: 'Product deleted',    cls: 'bg-red-50 text-red-600' },
  STOCK_UPDATED:        { label: 'Stock updated',      cls: 'bg-orange-50 text-orange-600' },
  CATEGORY_CREATED:     { label: 'Category created',   cls: 'bg-emerald-50 text-emerald-600' },
  CATEGORY_UPDATED:     { label: 'Category updated',   cls: 'bg-amber-50 text-amber-600' },
  CATEGORY_DELETED:     { label: 'Category deleted',   cls: 'bg-red-50 text-red-600' },
  USER_CREATED:         { label: 'User created',       cls: 'bg-sky-50 text-sky-600' },
  USER_UPDATED:         { label: 'User updated',       cls: 'bg-zinc-100 text-zinc-600' },
  USER_DEACTIVATED:     { label: 'User deactivated',   cls: 'bg-red-50 text-red-500' },
}

function actionLabel(action) { return ACTION_META[action]?.label ?? action }
function actionClass(action)  { return ACTION_META[action]?.cls  ?? 'bg-zinc-100 text-zinc-600' }

function entityLink(log) {
  if (!log.entityId) return null
  if (log.entity === 'order')    return `/admin/orders/${log.entityId}`
  if (log.entity === 'product')  return `/admin/products/${log.entityId}`
  if (log.entity === 'category') return `/admin/categories/${log.entityId}`
  if (log.entity === 'user')     return `/admin/users/${log.entityId}`
  return null
}

function formatMeta(action, meta) {
  if (!meta) return '—'
  if (action === 'ORDER_STATUS_CHANGED') return `${meta.from} → ${meta.to}`
  if (action === 'ORDER_CANCELLED')     return `${meta.from} → CANCELLED${meta.reason ? ` · "${meta.reason}"` : ''}${meta.refundStatus === 'PENDING' ? ' · refund pending' : ''}`
  if (action === 'ORDER_REFUNDED')      return `ETB ${meta.amount}${meta.note ? ` · "${meta.note}"` : ''}`
  if (action === 'PAYMENT_VERIFIED')     return `${meta.paymentStatus}${meta.note ? ` · "${meta.note}"` : ''}`
  if (action === 'DELIVERY_ASSIGNED')    return meta.deliveryPersonId ? `Assigned to #${meta.deliveryPersonId}` : 'Unassigned'
  if (action === 'PRODUCT_CREATED')      return `${meta.name} · ETB ${meta.price} · stock ${meta.stock}`
  if (action === 'PRODUCT_UPDATED')      return meta.reason ?? '—'
  if (action === 'PRODUCT_DELETED')      return meta.name ?? '—'
  if (action === 'STOCK_UPDATED')        return `${meta.from} → ${meta.to}`
  if (action === 'CATEGORY_CREATED')     return `${meta.name} (${meta.slug})`
  if (action === 'CATEGORY_UPDATED')     return meta.reason ?? '—'
  if (action === 'CATEGORY_DELETED')     return meta.name ?? '—'
  if (action === 'USER_CREATED')         return `${meta.email} (${meta.role})`
  if (action === 'USER_UPDATED')         return `Fields: ${Array.isArray(meta.fields) ? meta.fields.join(', ') : '—'}`
  if (action === 'USER_DEACTIVATED')     return `${meta.email ?? ''} (${meta.role ?? ''})`
  return JSON.stringify(meta)
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

onMounted(() => fetch(1))
useHead({ title: 'Audit Log — Admin' })
</script>
